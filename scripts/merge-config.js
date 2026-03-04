/**
 * Merges data/providers.json and data/supermarket.json into hexanode-workflow/config.staging.json
 * Run before: cre workflow simulate hexanode-workflow --target staging-settings
 */
const { readFile, writeFile } = require("fs/promises");
const { join } = require("path");

const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");
const CONFIG_PATH = join(ROOT, "hexanode-workflow", "config.staging.json");

async function main() {
  let providers = [];
  let inventory = [];

  try {
    const pRaw = await readFile(join(DATA, "providers.json"), "utf-8");
    const pData = JSON.parse(pRaw);
    providers = (pData.providers || []).map((p) => ({
      ...p,
      apiPath: p.apiPath ?? `/supply/${(p.products?.[0] || "default").toLowerCase()}`,
    }));
  } catch (e) {
    if (e.code !== "ENOENT") console.warn("providers.json:", e.message);
  }

  try {
    const sRaw = await readFile(join(DATA, "supermarket.json"), "utf-8");
    const sData = JSON.parse(sRaw);
    inventory = sData.inventory || [];
  } catch (e) {
    if (e.code !== "ENOENT") console.warn("supermarket.json:", e.message);
  }

  const configRaw = await readFile(CONFIG_PATH, "utf-8");
  const config = JSON.parse(configRaw);
  config.providers = providers;
  config.inventory = inventory;
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("Merged", providers.length, "agents and", inventory.length, "inventory items into config.");
}

main().catch(console.error);
