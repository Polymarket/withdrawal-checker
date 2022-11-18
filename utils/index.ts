import { ethers } from "ethers";
import { ERC20_TRANSFER_EVENT_SIG } from "@tomfrench/matic-proofs";
import { provider } from "./constants";
import UsdcAbi from "./abi/USDC.json";

const burnAddress = "0x0000000000000000000000000000000000000000";

/**
 * @function getLastBurnTxHash - Gets the last burn transaction hash for a given address
 * @param {string} address - the customer's Polymarket account address
 * @returns {string} - the transaction hash
 * */
export const getLastBurnTxHash = async (
    address: string,
): Promise<Array<string>> => {
    const toBlock = await provider.getBlockNumber();
    const fromBlock = toBlock - 500000;

    const logs: Array<any> = await provider.getLogs({
        fromBlock,
        toBlock,
        topics: [
            ERC20_TRANSFER_EVENT_SIG,
            ethers.utils.hexZeroPad(address, 32),
            ethers.utils.hexZeroPad(burnAddress, 32),
        ],
    });

    const iface = new ethers.utils.Interface(UsdcAbi);
    const decodedData = iface.decodeEventLog(
        ERC20_TRANSFER_EVENT_SIG,
        logs[logs.length - 1].data,
    );
    const value = decodedData.value.toString();
    const lastBurnTransactionHash = logs[logs.length - 1].transactionHash;
    return [lastBurnTransactionHash, value];
};

/**
 * Given a dollar amount, format it
 * @param dollar
 */
export const formatNumbers = (dollar: number | string): string => {
    const amount = parseFloat(dollar as any);
    const isValid = !Number.isNaN(amount) && Number.isFinite(amount);
    const output = isValid
        ? amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : "0.00";
    return output;
};

/**
 * @function USDCFormat - formats a USDC BigNumber string for display
 * @params {bigNUmberString} - string resulting from calling toString() on a BigNumber value retrieve from USDC contract
 * @returns {string} - the formated string
 */
export const USDCFormat = (bigNumberString: string): string => {
    return `$${formatNumbers(ethers.utils.formatUnits(bigNumberString, 6))}`;
};
