// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * HexaNodeRegistry - Onchain record of verified procurement settlements
 * Stores execution digest + tx references for tamper-evident audit trail
 */
contract HexaNodeRegistry {
    struct Record {
        string procurementId;
        string product;
        uint256 quantity;
        string providerId;
        string paymentTxHash;
        bytes32 digest;
        uint256 timestamp;
    }

    mapping(string => Record) public records;
    string[] public recordIds;

    event Recorded(
        string indexed procurementId,
        string product,
        uint256 quantity,
        string providerId,
        string paymentTxHash,
        bytes32 digest
    );

    function record(
        string calldata procurementId,
        string calldata product,
        uint256 quantity,
        string calldata providerId,
        string calldata paymentTxHash,
        bytes32 digest
    ) external {
        require(bytes(procurementId).length > 0, "Empty procurementId");
        require(records[procurementId].timestamp == 0, "Already recorded");

        records[procurementId] = Record({
            procurementId: procurementId,
            product: product,
            quantity: quantity,
            providerId: providerId,
            paymentTxHash: paymentTxHash,
            digest: digest,
            timestamp: block.timestamp
        });

        recordIds.push(procurementId);

        emit Recorded(procurementId, product, quantity, providerId, paymentTxHash, digest);
    }

    function getRecord(string calldata procurementId)
        external
        view
        returns (
            string memory product,
            uint256 quantity,
            string memory providerId,
            string memory paymentTxHash,
            bytes32 digest,
            uint256 timestamp
        )
    {
        Record memory r = records[procurementId];
        return (r.product, r.quantity, r.providerId, r.paymentTxHash, r.digest, r.timestamp);
    }
}
