#!/usr/bin/env bash
# HexaNode - Reproducible simulation script
# Prereqs: Provider running (cd provider && bun run start), .env with CRE_ETH_PRIVATE_KEY and DEEPSEEK_API_KEY

set -e

echo "HexaNode Simulation"
echo ""

if [ ! -f .env ]; then
  echo "Missing .env - copy .env.example and add CRE_ETH_PRIVATE_KEY, DEEPSEEK_API_KEY"
  exit 1
fi

# Optional: check provider
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/supply/milk 2>/dev/null | grep -q .; then
  echo "Provider may not be running. Start with: cd provider && bun run start"
  echo "Continuing anyway..."
fi

echo "Running CRE workflow simulate..."
cre workflow simulate hexanode-workflow --target staging-settings
