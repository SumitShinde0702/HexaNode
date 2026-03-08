#!/usr/bin/env node
/**
 * create-hexanode-agent <agent-id>
 * Fetches config bundle from HexaNode Infra API and configures your project.
 * Run from HexaNode repo root.
 */
import { spawn } from "child_process";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_URL = process.env.HEXANODE_API_URL || "http://localhost:3002";
const HEXANODE_ROOT = process.env.HEXANODE_ROOT || join(process.cwd());

async function fetchBundle(agentId) {
  const res = await fetch(`${API_URL}/v1/agents/${agentId}/bundle`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch bundle: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  const agentId = process.argv[2];
  if (!agentId) {
    console.error("Usage: create-hexanode-agent <agent-id>");
    console.error("Example: create-hexanode-agent agent-abc123xyz");
    console.error("");
    console.error("First register: curl -X POST http://localhost:3002/v1/agents -H 'Content-Type: application/json' -d '{\"type\":\"buyer\",\"inventory\":[{\"product\":\"milk\",\"quantity\":10,\"unit\":\"gallons\",\"threshold\":20,\"reorderQuantity\":50}]}'");
    process.exit(1);
  }

  console.log("HexaNode Agent Setup");
  console.log("===================\n");
  console.log(`Fetching config for ${agentId}...`);

  let bundle;
  try {
    bundle = await fetchBundle(agentId);
  } catch (e) {
    console.error("Error:", e.message);
    console.error("Make sure the Infra API is running: cd infra && npm start");
    process.exit(1);
  }

  const dataDir = join(HEXANODE_ROOT, "data");
  const configPath = join(HEXANODE_ROOT, "hexanode-workflow", "config.staging.json");

  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, "supermarket.json"), JSON.stringify(bundle.supermarket, null, 2));
  await writeFile(join(dataDir, "providers.json"), JSON.stringify(bundle.providers, null, 2));
  await writeFile(configPath, JSON.stringify(bundle.config, null, 2));

  console.log("  ✓ Wrote data/supermarket.json");
  console.log("  ✓ Wrote data/providers.json");
  console.log("  ✓ Wrote hexanode-workflow/config.staging.json");

  console.log("\nMerging config...");
  const merge = spawn("node", ["scripts/merge-config.js"], {
    cwd: HEXANODE_ROOT,
    stdio: "inherit",
    shell: true,
  });
  const exitCode = await new Promise((res) => merge.on("close", res));
  if (exitCode !== 0) {
    console.error("merge-config failed");
    process.exit(exitCode);
  }

  console.log("\n✓ Agent configured successfully!\n");
  console.log("Next steps:");
  console.log("  1. Start the provider:  cd provider && bun run start");
  console.log("  2. Run simulation:     cre workflow simulate hexanode-workflow --target staging-settings");
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
