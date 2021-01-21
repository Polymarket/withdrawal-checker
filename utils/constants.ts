import { ethers } from "ethers";
const MAINNET_NODE: string = "https://mainnet.infura.io/v3/b5ab0c2995454d1abe5cbdfe162af992";
const MATIC_NODE: string = "https://rpc-mainnet.maticvigil.com/v1/033be9d85736f034304850e435a58027165ddf1e";
export const provider = new ethers.providers.JsonRpcProvider(MATIC_NODE);
import UsdcAbi from "./abi/USDC.json";
export const CONTRACT_ADDRESS: string = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const rootChainContractAddress = "0x47195A03fC3Fc2881D084e8Dc03bD19BE8474E46"
export const contract = new ethers.Contract(CONTRACT_ADDRESS, UsdcAbi, provider);
export const rootChainProvider =  new ethers.providers.JsonRpcProvider(MAINNET_NODE);



