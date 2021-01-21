import {  ethers } from "ethers";
import { contract, provider } from "./constants";
const burnAddress = "0x0000000000000000000000000000000000000000";

/**
 * @function getLastBurnTxHash - Gets the last burn transaction hash for a given address
 * @param {string} address - the customer's Polymarket account address
 * @returns {string} - the transaction hash
 * */
export const getLastBurnTxHash = async (
    address: string,
): Promise<string> => {
    const event = await contract.filters.Transfer(address, burnAddress);
    const id = event.topics[0];
   
    const _toBlock = await provider.getBlockNumber();
    const _fromBlock = _toBlock - 100000;

    const log: Array<any> = await provider.getLogs({

        fromBlock: _fromBlock,
        toBlock: _toBlock,
        topics: [
            id,
            ethers.utils.hexZeroPad(address, 32),
            ethers.utils.hexZeroPad(burnAddress, 32),
        ],
    });

    const lastBurnTransactionHash = log[log.length - 1].transactionHash;
    return lastBurnTransactionHash;
};
