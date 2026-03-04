/**
 * HexaNode API - reads/writes agents (providers) and inventory JSON
 */
import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PROVIDERS_PATH = join(DATA_DIR, "providers.json");
const SUPERMARKET_PATH = join(DATA_DIR, "supermarket.json");

const app = express();
app.use(cors());
app.use(express.json());

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

// --- Agents (Providers) ---
app.get("/api/agents", async (_req, res) => {
  try {
    const raw = await readFile(PROVIDERS_PATH, "utf-8");
    const data = JSON.parse(raw);
    res.json(data.providers ?? []);
  } catch (e) {
    if (e.code === "ENOENT") {
      res.json([]);
      return;
    }
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/agents", async (req, res) => {
  try {
    await ensureDataDir();
    const raw = await readFile(PROVIDERS_PATH, "utf-8").catch(() => '{"providers":[]}');
    const data = JSON.parse(raw);
    const agent = { ...req.body, id: req.body.id || `provider-${Date.now()}` };
    if (!agent.name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    agent.products = agent.products ?? [];
    agent.tags = agent.tags ?? [];
    agent.basePricePerUnit = Number(agent.basePricePerUnit) ?? 0;
    agent.minOrderQuantity = Number(agent.minOrderQuantity) ?? 0;
    agent.slaHours = Number(agent.slaHours) ?? 0;
    agent.apiPath = agent.apiPath ?? `/supply/${(agent.products[0] || "default").toLowerCase()}`;
    data.providers.push(agent);
    await writeFile(PROVIDERS_PATH, JSON.stringify(data, null, 2));
    res.json(agent);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/agents/:id", async (req, res) => {
  try {
    const raw = await readFile(PROVIDERS_PATH, "utf-8");
    const data = JSON.parse(raw);
    const i = data.providers.findIndex((p) => p.id === req.params.id);
    if (i < 0) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    data.providers[i] = { ...data.providers[i], ...req.body };
    await writeFile(PROVIDERS_PATH, JSON.stringify(data, null, 2));
    res.json(data.providers[i]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/agents/:id", async (req, res) => {
  try {
    const raw = await readFile(PROVIDERS_PATH, "utf-8");
    const data = JSON.parse(raw);
    data.providers = data.providers.filter((p) => p.id !== req.params.id);
    await writeFile(PROVIDERS_PATH, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Inventory ---
app.get("/api/inventory", async (_req, res) => {
  try {
    const raw = await readFile(SUPERMARKET_PATH, "utf-8");
    const data = JSON.parse(raw);
    res.json(data.inventory ?? []);
  } catch (e) {
    if (e.code === "ENOENT") {
      res.json([]);
      return;
    }
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    await ensureDataDir();
    const raw = await readFile(SUPERMARKET_PATH, "utf-8").catch(() => '{"name":"Demo Supermarket","inventory":[],"updatedAt":""}');
    const data = JSON.parse(raw);
    const item = { ...req.body };
    if (!item.product) {
      res.status(400).json({ error: "product is required" });
      return;
    }
    item.quantity = Number(item.quantity) ?? 0;
    item.threshold = Number(item.threshold) ?? 0;
    item.reorderQuantity = Number(item.reorderQuantity) ?? 0;
    item.unit = item.unit ?? "units";
    data.inventory.push(item);
    data.updatedAt = new Date().toISOString();
    await writeFile(SUPERMARKET_PATH, JSON.stringify(data, null, 2));
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/inventory/:product", async (req, res) => {
  try {
    const raw = await readFile(SUPERMARKET_PATH, "utf-8");
    const data = JSON.parse(raw);
    const i = data.inventory.findIndex((x) => x.product === req.params.product);
    if (i < 0) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    data.inventory[i] = { ...data.inventory[i], ...req.body };
    data.updatedAt = new Date().toISOString();
    await writeFile(SUPERMARKET_PATH, JSON.stringify(data, null, 2));
    res.json(data.inventory[i]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/inventory/:product", async (req, res) => {
  try {
    const raw = await readFile(SUPERMARKET_PATH, "utf-8");
    const data = JSON.parse(raw);
    data.inventory = data.inventory.filter((x) => x.product !== req.params.product);
    data.updatedAt = new Date().toISOString();
    await writeFile(SUPERMARKET_PATH, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HexaNode API on http://localhost:${PORT}`);
});
