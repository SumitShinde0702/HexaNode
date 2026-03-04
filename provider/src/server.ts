/**
 * HexaNode Provider API - x402-compatible supplier endpoint
 * Returns HTTP 402 Payment Required when no payment; returns fulfillment data when paid.
 * Uses Ethereum Sepolia (CRE CLI supports it); USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
 */

const PORT = parseInt(process.env.PORT ?? "3456", 10);

// Configurable via env - no hardcoding
const PAY_TO = process.env.PROVIDER_PAY_TO ?? "0x0000000000000000000000000000000000000001";
const USDC_SEPOLIA = process.env.USDC_ADDRESS ?? "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const AMOUNT_ATOMIC = process.env.PAYMENT_AMOUNT_ATOMIC ?? "10000"; // 0.01 USDC (6 decimals)

function get402Response(product: string, quantity: number): object {
  return {
    x402Version: 1,
    error: "X-PAYMENT header is required",
    accepts: [
      {
        scheme: "exact",
        network: "ethereum-sepolia",
        maxAmountRequired: AMOUNT_ATOMIC,
        asset: USDC_SEPOLIA,
        payTo: PAY_TO,
        resource: `https://provider.hexanode.local/supply/${product}`,
        description: `Supply of ${quantity} units of ${product}`,
        mimeType: "application/json",
        outputSchema: null,
        maxTimeoutSeconds: 60,
        extra: { product, quantity, name: "USDC", version: "2" },
      },
    ],
  };
}

function getFulfillmentData(product: string, quantity: number, txHash: string): object {
  return {
    product,
    quantity,
    providerId: "provider-milk-fresh",
    price: parseFloat(AMOUNT_ATOMIC) / 1e6,
    txHash,
    status: "fulfilled",
    deliveredAt: new Date().toISOString(),
  };
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathMatch = url.pathname.match(/^\/supply\/([a-z]+)/);
    const product = pathMatch?.[1] ?? "milk";
    const quantity = parseInt(url.searchParams.get("quantity") ?? "50", 10);

    const paymentHeader = req.headers.get("x-payment") ?? req.headers.get("X-PAYMENT");

    if (!paymentHeader || paymentHeader.trim().length === 0) {
      return new Response(JSON.stringify(get402Response(product, quantity)), {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "X-402-Version": "1",
        },
      });
    }

    // Payment proof provided - return fulfillment
    const txHash = paymentHeader.trim();
    return new Response(JSON.stringify(getFulfillmentData(product, quantity, txHash)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`HexaNode Provider listening on http://localhost:${server.port}`);
console.log(`Try: curl http://localhost:${server.port}/supply/milk?quantity=50`);
