import {  ethers } from "ethers";
import { contract, provider } from "./constants";
import UsdcAbi from "./abi/USDC.json";
const burnAddress = "0x0000000000000000000000000000000000000000";
import {
    isBurnTxClaimable,
    ERC20_TRANSFER_EVENT_SIG,
} from "@tomfrench/matic-proofs";

/**
 * @function getLastBurnTxHash - Gets the last burn transaction hash for a given address
 * @param {string} address - the customer's Polymarket account address
 * @returns {string} - the transaction hash
 * */
export const getLastBurnTxHash = async (
    address: string,
): Promise<Array<string>> => {
    const event = await contract.filters.Transfer(address, burnAddress);
    const id = event.topics[0];
   
    const _toBlock = await provider.getBlockNumber();
    const _fromBlock = _toBlock - 100000;

    const logs: Array<any> = await provider.getLogs({

        fromBlock: _fromBlock,
        toBlock: _toBlock,
        topics: [
            id,
            ethers.utils.hexZeroPad(address, 32),
            ethers.utils.hexZeroPad(burnAddress, 32),
        ],
    });
    console.log(logs);
    const iface = new ethers.utils.Interface(UsdcAbi )
    const decodedData = iface.decodeEventLog(ERC20_TRANSFER_EVENT_SIG, logs[logs.length - 1].data);
    const value = parseInt(decodedData.value);
    const lastBurnTransactionHash = logs[logs.length - 1].transactionHash;
    return [ lastBurnTransactionHash, value ];
};
