import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { keccak256 as solidityKeccak256 } from "@ethersproject/solidity";
import checkpointManagerABI from "./abi/ICheckpointManager.json";
import rootChainABI from "./abi/RootChainManager.json";
import { receiptMerklePatriciaProof } from "./proofs/receiptProof";
import { getFullBlockByHash } from "./blocks";
import { getLogIndex } from "./logIndex";
import { RequiredBlockMembers } from "./types";

export const isBurnTxProcessed = async (
  rootChainProvider: Provider,
  maticChainProvider: JsonRpcProvider,
  rootChainContractAddress: string,
  burnTxHash: string,
  logEventSig: string,
): Promise<boolean> => {
  const burnTxReceipt = await maticChainProvider.getTransactionReceipt(burnTxHash);
  if (typeof burnTxReceipt.blockNumber === "undefined") {
    throw new Error("Could not find find blocknumber of burn transaction");
  }

  const burnTxBlock: RequiredBlockMembers = await getFullBlockByHash(maticChainProvider, burnTxReceipt.blockHash);
  const { path } = await receiptMerklePatriciaProof(maticChainProvider, burnTxReceipt, burnTxBlock);

  const nibbleArray: Buffer[] = [];
  // RootChain.sol drops first byte (2 nibbles) from nibble array when calculating nibbleArray
  arrayify(path)
    .slice(1)
    .forEach(byte => {
      nibbleArray.push(Buffer.from("0" + (byte / 0x10).toString(16), "hex"));
      nibbleArray.push(Buffer.from("0" + (byte % 0x10).toString(16), "hex"));
    });
  const nibblesHex = hexlify(concat(nibbleArray));

  const logIndex = getLogIndex(burnTxReceipt, logEventSig);
  const exitHash = solidityKeccak256(
    ["uint256", "bytes", "uint256"],
    [burnTxReceipt.blockNumber, nibblesHex, logIndex],
  );

  const rootChainContract = new Contract(rootChainContractAddress, rootChainABI, rootChainProvider);
  return rootChainContract.processedExits(exitHash);
};

export const isBlockCheckpointed = async (
  rootChainProvider: Provider,
  rootChainContractAddress: string,
  blockNumber: BigNumberish,
): Promise<boolean> => {
  const rootChainContract = new Contract(rootChainContractAddress, rootChainABI, rootChainProvider);
  const checkpointManagerAddress = await rootChainContract.checkpointManagerAddress();
  const checkpointManagerContract = new Contract(checkpointManagerAddress, checkpointManagerABI, rootChainProvider);
  const lastChildBlock = await checkpointManagerContract.getLastChildBlock();

  return BigNumber.from(lastChildBlock).gte(blockNumber);
};

export const isBurnTxCheckpointed = async (
  rootChainProvider: Provider,
  maticChainProvider: JsonRpcProvider,
  rootChainContractAddress: string,
  burnTxHash: string,
): Promise<boolean> => {
  const burnTx = await maticChainProvider.getTransaction(burnTxHash);
  if (typeof burnTx === null) {
    throw new Error("Could not find transaction corresponding to burnTxHash");
  } else if (typeof burnTx.blockNumber === "undefined") {
    throw new Error("Could not find blocknumber of burnTx");
  }

  return isBlockCheckpointed(rootChainProvider, rootChainContractAddress, burnTx.blockNumber);
};

export const isBurnTxClaimable = async (
  rootChainProvider: Provider,
  maticChainProvider: JsonRpcProvider,
  rootChainContractAddress: string,
  burnTxHash: string,
  logEventSig: string,
): Promise<boolean> => {
  const checkpointed = await isBurnTxCheckpointed(
    rootChainProvider,
    maticChainProvider,
    rootChainContractAddress,
    burnTxHash,
  );
  const alreadyClaimed = await isBurnTxProcessed(
    rootChainProvider,
    maticChainProvider,
    rootChainContractAddress,
    burnTxHash,
    logEventSig,
  );
  // Withdrawal can be claimed if it is checkpointed and hasn't already been claimed
  return checkpointed && !alreadyClaimed;
};
