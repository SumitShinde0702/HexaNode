/**
 * HexaNode workflow types - all config-driven, no hardcoded business values
 */

export interface InventoryItem {
  product: string;
  quantity: number;
  unit: string;
  threshold: number;
  reorderQuantity: number;
}

export interface Provider {
  id: string;
  name: string;
  products: string[];
  tags: string[];
  basePricePerUnit: number;
  minOrderQuantity: number;
  slaHours: number;
  apiPath?: string;
}

export interface NegotiationParams {
  maxRounds: number;
  timeoutSeconds: number;
}

export interface VerificationParams {
  minScoreThreshold: number;
  requiredFields: string[];
}

export interface Config {
  providerBaseUrl: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  chainName: string;
  registryAddress: string;
  paymentReceiverAddress: string;
  inventory: InventoryItem[];
  providers: Provider[];
  negotiation: NegotiationParams;
  verification: VerificationParams;
}

export type WorkflowState =
  | "needDetected"
  | "search"
  | "negotiate"
  | "payment"
  | "verified";

export interface ProcurementNeed {
  product: string;
  quantity: number;
  unit: string;
}

export interface NegotiatedTerms {
  product: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  providerId: string;
}

export interface PaymentRequirement {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string;
  description?: string;
  maxTimeoutSeconds: number;
}

export interface X402Response {
  x402Version: number;
  error?: string;
  accepts: PaymentRequirement[];
}

export interface FulfillmentData {
  product: string;
  quantity: number;
  providerId: string;
  price: number;
  txHash?: string;
  status?: string;
}

export interface RunLog {
  procurementId: string;
  state: WorkflowState;
  timestamp: string;
  data: unknown;
}
