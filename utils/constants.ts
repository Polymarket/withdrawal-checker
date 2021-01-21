import { ethers } from "ethers";
const MAINNET_NODE: string = "https://mainnet.infura.io/v3/a414a8f640db48c5aa8fcc3bf29353e8";
const MATIC_NODE: string = "https://rpc-mainnet.maticvigil.com/v1/ea1bb94329e5fa87489704c1141745bdab51f1b0";
export const provider = new ethers.providers.JsonRpcProvider(MATIC_NODE);
import UsdcAbi from "./abi/USDC.json";
export const CONTRACT_ADDRESS: string = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const rootChainContractAddress = "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77"
export const contract = new ethers.Contract(CONTRACT_ADDRESS, UsdcAbi, provider);
export const rootChainProvider =  new ethers.providers.JsonRpcProvider(MAINNET_NODE);

