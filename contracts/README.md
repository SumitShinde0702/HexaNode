# HexaNode Contracts

## HexaNodePaymentReceiver.sol (Real USDC Payments)

Executes **real** Base Sepolia USDC transfers for x402 payments. The CRE workflow sends `(payTo, amount)` via `writeReport`; the contract does `USDC.transferFrom(workflowOwner, payTo, amount)`.

### Deploy (Base Sepolia)

1. Get KeystoneForwarder address for Base Sepolia from [Forwarder Directory](https://docs.chain.link/cre/guides/workflow/using-evm-client/forwarder-directory) or Chainlink docs.
2. USDC on Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
3. Deploy: `HexaNodePaymentReceiver(forwarderAddress, usdcAddress)`
4. **One-time**: From your workflow wallet (CRE_ETH_PRIVATE_KEY), approve USDC:  
   `USDC.approve(paymentReceiverAddress, type(uint256).max)`
5. Add `paymentReceiverAddress` to `hexanode-workflow/config.staging.json`.

When configured, the workflow performs **real** Base Sepolia USDC transfers. The transaction hash is used as the x402 payment proof.

---

## HexaNodeRegistry.sol

Stores verified procurement settlements onchain. For CRE integration, this contract must implement the Chainlink `IReceiver` interface so the workflow's `writeReport` can deliver data.

### Deployment (Base Sepolia)

1. Get the KeystoneForwarder address for Base Sepolia from [Chainlink Forwarder Directory](https://docs.chain.link/cre/guides/workflow/using-evm-client/forwarder-directory)
2. Deploy `HexaNodeReceiver` (a contract extending `ReceiverTemplate`) with the forwarder address
3. In `_processReport`, decode the payload and store the record
4. Add the deployed receiver address to `hexanode-workflow/config.staging.json` as `registryAddress`

### Receiver Payload Format

The workflow encodes:

```
(string procurementId, string product, uint256 quantity, string providerId, string paymentTxHash, bytes32 digest)
```

Decode in Solidity:

```solidity
(string memory id, string memory product, uint256 quantity, string memory providerId, string memory txHash, bytes32 digest) =
  abi.decode(report, (string, string, uint256, string, string, bytes32));
```

For a complete Receiver example, see [Chainlink CRE Building Consumer Contracts](https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts).
