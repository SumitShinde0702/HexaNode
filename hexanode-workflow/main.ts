/**
 * HexaNode - Autonomous procurement workflow
 * States: needDetected -> search -> negotiate -> payment -> verified
 * Chainlink CRE + x402 + Base Sepolia
 */

import {
  CronCapability,
  handler,
  Runner,
  HTTPClient,
  EVMClient,
  getNetwork,
  bytesToHex,
  hexToBase64,
  consensusMedianAggregation,
  consensusIdenticalAggregation,
  type Runtime,
  type HTTPSendRequester,
} from "@chainlink/cre-sdk"
import { encodeAbiParameters, parseAbiParameters } from "viem"
import type {
  Config,
  WorkflowState,
  ProcurementNeed,
  Provider,
  NegotiatedTerms,
  X402Response,
  FulfillmentData,
  RunLog,
} from "./types"

const PROCUREMENT_ID_PREFIX = "hex-"

function generateProcurementId(): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `${PROCUREMENT_ID_PREFIX}${t}-${r}`
}

function logState(runtime: Runtime<Config>, state: WorkflowState, data: unknown): void {
  const entry: RunLog = {
    procurementId: (runtime as unknown as { _procurementId?: string })._procurementId ?? "pending",
    state,
    timestamp: new Date().toISOString(),
    data,
  }
  runtime.log(`[${state}] ${JSON.stringify(entry)}`)
}

// --- needDetected ---
function detectNeed(config: Config): ProcurementNeed | null {
  for (const item of config.inventory) {
    if (item.quantity < item.threshold) {
      return {
        product: item.product,
        quantity: item.reorderQuantity,
        unit: item.unit,
      }
    }
  }
  return null
}

// --- search ---
function searchProviders(config: Config, need: ProcurementNeed): Provider | null {
  const candidates = config.providers.filter((p) =>
    p.products.some((prod) => prod.toLowerCase() === need.product.toLowerCase())
  )
  if (candidates.length === 0) return null
  return candidates[0]
}

// --- negotiate (via DeepSeek) ---
const negotiateWithLLM = (
  sendRequester: HTTPSendRequester,
  apiKey: string,
  baseUrl: string,
  model: string,
  need: ProcurementNeed,
  provider: Provider
): NegotiatedTerms => {
  const body = JSON.stringify({
    model,
    messages: [
      {
        role: "system",
        content: `You are a procurement agent. Output ONLY valid JSON matching: {"product":"string","quantity":number,"pricePerUnit":number,"totalPrice":number,"providerId":"string"}. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Negotiate terms: need ${need.quantity} ${need.unit} of ${need.product}. Provider ${provider.name} (id: ${provider.id}) base price ${provider.basePricePerUnit}/unit, min order ${provider.minOrderQuantity}. Return accepted terms as JSON.`,
      },
    ],
    max_tokens: 256,
  })

  const bodyB64 = Buffer.from(body, "utf-8").toString("base64")
  const url = `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`

  const response = sendRequester
    .sendRequest({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: bodyB64,
      timeout: "30s",
    })
    .result()

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`DeepSeek API failed: ${response.statusCode}`)
  }

  const raw = new TextDecoder().decode(response.body)
  const parsed = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> }
  const content = parsed?.choices?.[0]?.message?.content?.trim() ?? ""
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : content
  const terms = JSON.parse(jsonStr) as Record<string, unknown>

  return {
    product: String(terms.product ?? need.product),
    quantity: Number(terms.quantity ?? need.quantity),
    pricePerUnit: Number(terms.pricePerUnit ?? provider.basePricePerUnit),
    totalPrice: Number(terms.totalPrice ?? 0) || Number(terms.pricePerUnit ?? provider.basePricePerUnit) * need.quantity,
    providerId: String(terms.providerId ?? provider.id),
  }
}

// --- payment (402 + EVM) ---
const fetchProviderOr402 = (
  sendRequester: HTTPSendRequester,
  url: string
): { status: number; body: string; is402: boolean } => {
  const response = sendRequester.sendRequest({ url, method: "GET", timeout: "10s" }).result()
  const body = new TextDecoder().decode(response.body)
  return {
    status: response.statusCode,
    body,
    is402: response.statusCode === 402,
  }
}

const fetchWithPayment = (
  sendRequester: HTTPSendRequester,
  url: string,
  txHash: string
): { status: number; body: string } => {
  const response = sendRequester
    .sendRequest({
      url,
      method: "GET",
      headers: { "X-PAYMENT": txHash },
      timeout: "10s",
    })
    .result()
  const body = new TextDecoder().decode(response.body)
  return { status: response.statusCode, body }
}

// --- verified ---
function verifyFulfillment(config: Config, data: FulfillmentData): boolean {
  const required = config.verification.requiredFields
  for (const field of required) {
    if (!(field in data) || (data as Record<string, unknown>)[field] == null) {
      return false
    }
  }
  return true
}

// --- Main callback ---
const onProcurementTrigger = (runtime: Runtime<Config>): Record<string, unknown> => {
  const config = runtime.config
  const procurementId = generateProcurementId()
  ;(runtime as unknown as { _procurementId?: string })._procurementId = procurementId

  runtime.log(`HexaNode started procurement ${procurementId}`)
  runtime.log(`Config snapshot (safe): providerBaseUrl=${config.providerBaseUrl}, chain=${config.chainName}`)

  // 1. needDetected
  const need = detectNeed(config)
  if (!need) {
    logState(runtime, "needDetected", { reason: "no_items_below_threshold" })
    return { ok: false, reason: "No inventory items below threshold" }
  }
  logState(runtime, "needDetected", { need })

  // 2. search
  const provider = searchProviders(config, need)
  if (!provider) {
    logState(runtime, "search", { error: "no_matching_provider" })
    return { ok: false, reason: "No provider found" }
  }
  logState(runtime, "search", { provider: { id: provider.id, name: provider.name } })

  // 3. negotiate (DeepSeek)
  let terms: NegotiatedTerms
  try {
    const apiKey = runtime.getSecret({ id: "DEEPSEEK_API_KEY" }).result().value
    if (!apiKey || apiKey.length < 10) {
      throw new Error("DEEPSEEK_API_KEY missing or invalid")
    }
    const httpClient = new HTTPClient()
    terms = httpClient
      .sendRequest(
        runtime,
        (req, n: ProcurementNeed, p: Provider) =>
          negotiateWithLLM(req, apiKey, config.deepseekBaseUrl, config.deepseekModel, n, p),
        consensusMedianAggregation<NegotiatedTerms>()
      )(need, provider)
      .result()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    logState(runtime, "negotiate", { error: msg })
    return { ok: false, reason: `Negotiation failed: ${msg}` }
  }
  logState(runtime, "negotiate", { terms })

  // 4. payment (402 handshake)
  const providerUrl = `${config.providerBaseUrl.replace(/\/$/, "")}${provider.apiPath ?? "/supply/" + need.product}?quantity=${terms.quantity}`

  const httpClient = new HTTPClient()
  const firstFetch = httpClient
    .sendRequest(
      runtime,
      (req, u: string) => fetchProviderOr402(req, u),
      consensusIdenticalAggregation<{ status: number; body: string; is402: boolean }>()
    )(providerUrl)
    .result()

  if (!firstFetch.is402) {
    logState(runtime, "payment", { error: "expected_402", status: firstFetch.status })
    return { ok: false, reason: "Provider did not return 402" }
  }

  let paymentReq: X402Response
  try {
    paymentReq = JSON.parse(firstFetch.body) as X402Response
  } catch {
    return { ok: false, reason: "Invalid 402 response" }
  }

  const accept = paymentReq.accepts?.find((a) => a.network === "ethereum-sepolia" || a.network === "ethereum-testnet-sepolia") ?? paymentReq.accepts?.[0]
  if (!accept) {
    return { ok: false, reason: "No payment option for ethereum-sepolia" }
  }

  const chainSelectorName = config.chainName
  const network = getNetwork({
    chainFamily: "evm",
    chainSelectorName,
    isTestnet: true,
  })
  if (!network) {
    return { ok: false, reason: `Unknown chain: ${config.chainName}` }
  }

  const evmClient = new EVMClient(network.chainSelector.selector)

  let paymentTxHash: string
  const payTo = accept.payTo as `0x${string}`
  const amount = BigInt(accept.maxAmountRequired)

  if (config.paymentReceiverAddress && config.paymentReceiverAddress.length > 10) {
    try {
      const reportData = encodeAbiParameters(
        parseAbiParameters("address,uint256"),
        [payTo, amount]
      )
      const reportResponse = runtime
        .report({
          encodedPayload: hexToBase64(reportData),
          encoderName: "evm",
          signingAlgo: "ecdsa",
          hashingAlgo: "keccak256",
        })
        .result()

      const writeResult = evmClient
        .writeReport(runtime, {
          receiver: config.paymentReceiverAddress as `0x${string}`,
          report: reportResponse,
          gasConfig: { gasLimit: "200000" },
        })
        .result()

      const rawHash = writeResult.txHash
      paymentTxHash = rawHash && rawHash.length > 0 ? bytesToHex(rawHash) : `0x${Array(64).fill("0").map(() => Math.floor(Math.random() * 16).toString(16)).join("")}`
      if (!rawHash || rawHash.length === 0) {
        runtime.log("Simulation mode: no real tx hash from writeReport, using placeholder")
      }
      runtime.log(`USDC transfer tx: ${paymentTxHash}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      logState(runtime, "payment", { error: "usdc_transfer_failed", detail: msg })
      return { ok: false, reason: `Payment failed: ${msg}` }
    }
  } else {
    runtime.log(
      "paymentReceiverAddress not configured - using simulated hash for demo. Deploy HexaNodePaymentReceiver for real Base Sepolia USDC transfers."
    )
    paymentTxHash = `0x${Array(64)
      .fill("0")
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`
  }

  const secondFetch = httpClient
    .sendRequest(
      runtime,
      (req, u: string, h: string) => fetchWithPayment(req, u, h),
      consensusIdenticalAggregation<{ status: number; body: string }>()
    )(providerUrl, paymentTxHash)
    .result()

  if (secondFetch.status !== 200) {
    logState(runtime, "payment", { error: "provider_rejected", status: secondFetch.status })
    return { ok: false, reason: "Provider rejected payment" }
  }

  let fulfillment: FulfillmentData
  try {
    fulfillment = JSON.parse(secondFetch.body) as FulfillmentData
  } catch {
    return { ok: false, reason: "Invalid fulfillment response" }
  }

  logState(runtime, "payment", { txHash: paymentTxHash, fulfillment })

  // 5. verified
  const verified = verifyFulfillment(config, fulfillment)
  if (!verified) {
    logState(runtime, "verified", { ok: false, reason: "verification_failed" })
    return { ok: false, reason: "Verification failed" }
  }
  logState(runtime, "verified", { fulfillment })

  // 6. Registry write (optional - only if address configured)
  let txHash = paymentTxHash
  if (config.registryAddress && config.registryAddress.length > 10) {
    try {
      const digestInput = `${procurementId}:${fulfillment.product}:${fulfillment.quantity}:${fulfillment.providerId}:${fulfillment.txHash ?? paymentTxHash}`
      const digestBytes = new TextEncoder().encode(digestInput)
      let hash = 0
      for (let i = 0; i < digestBytes.length; i++) {
        hash = (hash << 5) - hash + digestBytes[i]
        hash |= 0
      }
      const digestHex = `0x${Math.abs(hash).toString(16).padStart(64, "0")}`

      const reportData = encodeAbiParameters(
        parseAbiParameters(
          "string,string,uint256,string,string,bytes32"
        ),
        [
          procurementId,
          fulfillment.product,
          BigInt(fulfillment.quantity),
          fulfillment.providerId,
          fulfillment.txHash ?? paymentTxHash,
          digestHex as `0x${string}`,
        ]
      )

      const reportResponse = runtime
        .report({
          encodedPayload: hexToBase64(reportData),
          encoderName: "evm",
          signingAlgo: "ecdsa",
          hashingAlgo: "keccak256",
        })
        .result()

      const writeResult = evmClient
        .writeReport(runtime, {
          receiver: config.registryAddress as `0x${string}`,
          report: reportResponse,
          gasConfig: { gasLimit: "300000" },
        })
        .result()

      txHash = bytesToHex(writeResult.txHash ?? new Uint8Array(32))
      runtime.log(`Registry tx: ${txHash}`)
    } catch (e) {
      runtime.log(`Registry write skipped: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return {
    ok: true,
    procurementId,
    need,
    terms,
    fulfillment,
    txHash,
    state: "verified" as WorkflowState,
  }
}

const initWorkflow = (config: Config) => {
  const cron = new CronCapability()
  const schedule = "*/60 * * * * *"
  return [handler(cron.trigger({ schedule }), onProcurementTrigger)]
}

export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}
