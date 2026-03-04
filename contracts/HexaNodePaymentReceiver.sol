// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IReceiver - receives CRE workflow reports
 */
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

/**
 * HexaNodePaymentReceiver - Executes USDC transfers for x402 payments
 * CRE workflow sends (payTo, amount); contract does transferFrom(workflowOwner, payTo, amount).
 * Workflow owner must approve this contract to spend USDC before running.
 *
 * Deploy with: forwarder address, USDC address (Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e)
 *
 * One-time setup: USDC.approve(paymentReceiverAddress, type(uint256).max)
 */
contract HexaNodePaymentReceiver is IReceiver {
    address public immutable forwarder;
    address public immutable usdc;

    error InvalidSender();
    error TransferFailed();

    constructor(address _forwarder, address _usdc) {
        require(_forwarder != address(0) && _usdc != address(0), "Zero address");
        forwarder = _forwarder;
        usdc = _usdc;
    }

    /**
     * @notice Called by Chainlink Forwarder. Decodes report and executes USDC transfer.
     * @param metadata Encoded (workflowId, workflowName, workflowOwner) - we use workflowOwner as payer
     * @param report ABI-encoded (address payTo, uint256 amount)
     */
    function onReport(bytes calldata metadata, bytes calldata report) external {
        if (msg.sender != forwarder) revert InvalidSender();

        address workflowOwner = _decodeWorkflowOwner(metadata);
        (address payTo, uint256 amount) = abi.decode(report, (address, uint256));

        bool ok = IERC20(usdc).transferFrom(workflowOwner, payTo, amount);
        if (!ok) revert TransferFailed();
    }

    function _decodeWorkflowOwner(bytes calldata metadata) internal pure returns (address) {
        // Layout from Forwarder: abi.encodePacked(workflowId:32, workflowName:10, workflowOwner:20)
        require(metadata.length >= 62, "Short metadata");
        uint256 word;
        assembly {
            word := calldataload(add(metadata.offset, 42))
            // Address is in high 20 bytes
            word := shr(96, word)
        }
        return address(uint160(word));
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IReceiver).interfaceId || interfaceId == 0x01ffc9a7; // IERC165
    }
}
