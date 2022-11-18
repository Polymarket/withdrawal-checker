import { ethers } from "ethers";
import UsdcAbi from "./abi/USDC.json";

const MAINNET_NODE: string =
    "https://eth-mainnet.alchemyapi.io/v2/3ZjURMaqw4EZ-2Oe3nafhnA7P-GgsYXR";
const MATIC_NODE: string =
    "https://polygon-mainnet.g.alchemy.com/v2/WtlYIQrqH3Eao-TyQL7uFVPVILwQv7Yk";
export const provider = new ethers.providers.JsonRpcProvider(MATIC_NODE);
export const CONTRACT_ADDRESS: string =
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const rootChainContractAddress =
    "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77";
export const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    UsdcAbi,
    provider,
);
export const rootChainProvider = new ethers.providers.JsonRpcProvider(
    MAINNET_NODE,
);
