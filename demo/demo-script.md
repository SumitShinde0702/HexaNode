# HexaNode Demo Video Script (3–5 min)

## Minute 0:00 – Intro
- "HexaNode is an autonomous procurement agent for supermarkets."
- "When milk drops below threshold, it finds a supplier, negotiates, pays via x402, and records onchain."
- Show repo, README, and `config.staging.json` (inventory with milk at 12, threshold 20).

## Minute 0:30 – Run Simulation
- Terminal 1: `cd provider && bun run start`
- Terminal 2: `cre workflow simulate hexanode-workflow --target staging-settings`
- "The workflow runs all five states without human intervention."

## Minute 1:30 – State Logs
- Point to logs: `[needDetected]`, `[search]`, `[negotiate]`, `[payment]`, `[verified]`
- "DeepSeek negotiates terms in structured JSON."
- "The provider returns HTTP 402 with payment instructions."

## Minute 2:30 – Payment & Verification
- "We parse the 402 response, execute the payment, and retry with the proof."
- "Provider releases fulfillment data. We verify it and optionally write to the registry."
- Show final output: `procurementId`, `terms`, `fulfillment`, `txHash`.

## Minute 3:30 – Config & Extensibility
- "Everything is config-driven: no hardcoded products or thresholds."
- "Change supermarket.json or providers in config to add eggs, bread, or new suppliers."
- "Fully autonomous agent-to-agent trade using CRE and x402."

## Minute 4:00 – Wrap
- "HexaNode: autonomous procurement, x402 payments, verifiable onchain settlement."
- Link to repo and hackathon.
