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

    const log: Array<any> = await provider.getLogs({
        fromBlock: 9800498,
        toBlock: await provider.getBlockNumber(),
        topics: [
            id,
            ethers.utils.hexZeroPad(address, 32),
            ethers.utils.hexZeroPad(burnAddress, 32),
        ],
    });

    const lastBurnTransactionHash = log[0].transactionHash;
    return lastBurnTransactionHash;
};
