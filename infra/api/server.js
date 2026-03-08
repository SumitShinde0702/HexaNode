/**
 * HexaNode Infra API - v1 agent registration + config bundle
 * POST /v1/agents - register buyer/seller
 * GET /v1/agents/:id/bundle - get runnable CRE config
 */
import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const REGISTRATIONS_PATH = join(DATA_DIR, "registrations.json");

const DEFAULT_PROVIDERS = [
  {
    id: "provider-milk-fresh",
    name: "Fresh Dairy Co",
    products: ["milk", "yogurt", "cream"],
    tags: ["dairy", "local", "organic"],
    basePricePerUnit: 3.5,
    minOrderQuantity: 10,
    slaHours: 24,
    apiPath: "/supply/milk",
  },
  {
    id: "provider-milk-bulk",
    name: "Bulk Supply Inc",
    products: ["milk", "eggs", "bread"],
    tags: ["wholesale", "bulk", "discount"],
    basePricePerUnit: 2.8,
    minOrderQuantity: 50,
    slaHours: 48,
    apiPath: "/supply/milk",
  },
  {
    id: "provider-dairy-regional",
    name: "Regional Dairy Partners",
    products: ["milk", "cheese"],
    tags: ["dairy", "regional"],
    basePricePerUnit: 3.2,
    minOrderQuantity: 20,
    slaHours: 36,
    apiPath: "/supply/milk",
  },
];

const BASE_CONFIG = {
  providerBaseUrl: "http://localhost:3456",
  deepseekBaseUrl: "https://api.deepseek.com",
  deepseekModel: "deepseek-chat",
  chainName: "ethereum-testnet-sepolia",
  registryAddress: "",
  paymentReceiverAddress: "",
  negotiation: { maxRounds: 3, timeoutSeconds: 60 },
  verification: { minScoreThreshold: 0.7, requiredFields: ["product", "quantity", "providerId", "price"] },
};

const app = express();
app.use(cors());
app.use(express.json());

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
}

async function getRegistrations() {
  try {
    const raw = await readFile(REGISTRATIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return { agents: [] };
    throw e;
  }
}

function generateId() {
  return `agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- POST /v1/agents ---
app.post("/v1/agents", async (req, res) => {
  try {
    await ensureDataDir();
    const regs = await getRegistrations();
    const { type, inventory, catalog, name } = req.body;

    if (!type || !["buyer", "seller"].includes(type)) {
      return res.status(400).json({ error: "type must be 'buyer' or 'seller'" });
    }

    const agent = {
      id: generateId(),
      type,
      name: name || `Agent ${type}`,
      inventory: type === "buyer" ? (inventory ?? []) : [],
      catalog: type === "seller" ? (catalog ?? []) : [],
      createdAt: new Date().toISOString(),
    };

    if (type === "buyer" && (!Array.isArray(agent.inventory) || agent.inventory.length === 0)) {
      agent.inventory = [
        { product: "milk", quantity: 12, unit: "gallons", threshold: 20, reorderQuantity: 50 },
      ];
    }

    if (type === "seller" && Array.isArray(agent.catalog) && agent.catalog.length > 0) {
      const seller = {
        id: agent.id,
        name: agent.name,
        products: agent.catalog.map((c) => c.product ?? c.name).filter(Boolean),
        tags: agent.catalog.flatMap((c) => c.tags ?? []),
        basePricePerUnit: agent.catalog[0]?.pricePerUnit ?? 3,
        minOrderQuantity: agent.catalog[0]?.minOrder ?? 10,
        slaHours: agent.catalog[0]?.slaHours ?? 24,
        apiPath: `/supply/${(agent.catalog[0]?.product ?? "default").toLowerCase()}`,
      };
      agent.providerConfig = seller;
    }

    regs.agents = regs.agents ?? [];
    regs.agents.push(agent);
    await writeFile(REGISTRATIONS_PATH, JSON.stringify(regs, null, 2));

    res.status(201).json({ id: agent.id, type: agent.type, message: "Agent registered. Use GET /v1/agents/:id/bundle to fetch config." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /v1/agents/:id ---
app.get("/v1/agents/:id", async (req, res) => {
  try {
    const regs = await getRegistrations();
    const agent = (regs.agents ?? []).find((a) => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /v1/agents/:id/bundle ---
app.get("/v1/agents/:id/bundle", async (req, res) => {
  try {
    const regs = await getRegistrations();
    const agent = (regs.agents ?? []).find((a) => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    let providers = [...DEFAULT_PROVIDERS];
    let inventory = agent.inventory ?? [];

    if (agent.type === "seller" && agent.providerConfig) {
      providers = [...providers, agent.providerConfig];
    }

    const config = {
      ...BASE_CONFIG,
      inventory,
      providers,
    };

    const supermarket = {
      name: agent.name || "Agent",
      inventory,
      updatedAt: new Date().toISOString(),
    };

    const providersData = { providers };

    res.json({
      agentId: agent.id,
      type: agent.type,
      config,
      supermarket,
      providers: providersData,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GET /v1/agents ---
app.get("/v1/agents", async (_req, res) => {
  try {
    const regs = await getRegistrations();
    res.json((regs.agents ?? []).map((a) => ({ id: a.id, type: a.type, name: a.name })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`HexaNode Infra API on http://localhost:${PORT}`);
  console.log("  POST /v1/agents - register agent");
  console.log("  GET  /v1/agents/:id/bundle - fetch config");
});
