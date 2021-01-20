import { arrayify, concat, hexlify } from "@ethersproject/bytes";
import { JsonRpcProvider, Provider, TransactionReceipt } from "@ethersproject/providers";
import { encode as rlpEncode, decode as rlpDecode } from "@ethersproject/rlp";
import { BaseTrie } from "merkle-patricia-tree";
import { BigNumber } from "@ethersproject/bignumber";
import { ReceiptMPProof, ReceiptProof, RequiredBlockMembers } from "../types";
import { getFullBlockByHash } from "../blocks";

export const getReceiptBytes = (receipt: TransactionReceipt): string => {
  return rlpEncode([
    // eslint-disable-next-line no-nested-ternary
    receipt.status !== undefined && receipt.status != null ? (receipt.status ? "0x1" : "0x") : receipt.root,
    BigNumber.from(receipt.cumulativeGasUsed).toHexString(),
    receipt.logsBloom,

    // encoded log array
    receipt.logs.map(l => {
      // [address, [topics array], data]
      return [l.address, l.topics, l.data];
    }),
  ]);
};

const buildReceiptTrie = async (provider: Provider, block: RequiredBlockMembers) => {
  const receipts = await Promise.all(block.transactions.map(tx => provider.getTransactionReceipt(tx)));
  const receiptsTrie = new BaseTrie();
  // Add all receipts to the trie
  for (let i = 0; i < receipts.length; i += 1) {
    const siblingReceipt = receipts[i];
    const path = rlpEncode(siblingReceipt.transactionIndex);
    const rawReceipt = getReceiptBytes(siblingReceipt);
    // eslint-disable-next-line no-await-in-loop
    await receiptsTrie.put(Buffer.from(arrayify(path)), Buffer.from(arrayify(rawReceipt)));
  }
  return receiptsTrie;
};

export const receiptMerklePatriciaProof = async (
  provider: Provider,
  receipt: TransactionReceipt,
  block: RequiredBlockMembers,
): Promise<ReceiptMPProof> => {
  const receiptsTrie = await buildReceiptTrie(provider, block);
  const { node, remaining, stack } = await receiptsTrie.findPath(Buffer.from(rlpEncode(receipt.transactionIndex)));

  if (node === null || remaining.length > 0) {
    throw new Error("Node does not contain the key");
  }

  return {
    blockHash: receipt.blockHash,
    parentNodes: (stack.map(trieNode => trieNode.raw()) as unknown) as Buffer[],
    root: block.receiptsRoot,
    path: hexlify(concat(["0x00", rlpEncode(receipt.transactionIndex)])),
    value: node.value != null ? rlpDecode(node.value) : null,
  };
};

export const buildReceiptProof = async (
  maticChainProvider: JsonRpcProvider,
  burnTxHash: string,
): Promise<ReceiptProof> => {
  const receipt = await maticChainProvider.getTransactionReceipt(burnTxHash);
  const burnTxBlock = await getFullBlockByHash(maticChainProvider, receipt.blockHash);
  // Build proof that the burn transaction is included in this block.
  const receiptProof = await receiptMerklePatriciaProof(maticChainProvider, receipt, burnTxBlock);

  return {
    receipt,
    receiptProof,
    receiptsRoot: burnTxBlock.receiptsRoot,
  };
};
