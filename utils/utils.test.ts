import {
    isBurnTxClaimable,
    ERC20_TRANSFER_EVENT_SIG,
} from "@tomfrench/matic-proofs";
import { getLastBurnTxHash } from ".";
import {
    provider,
    rootChainContractAddress,
    rootChainProvider,
} from "./constants";


describe("getLastBurnTxHash", () => {
    test("should get the last burn tx for a given address", async function () {
        const address = "0x822276EB1df687f4faB5D29adA0d30590C510311";
        const burnTx = await getLastBurnTxHash(address);
        console.log(burnTx);
    });
});

describe("isBurnTxClaimable", () => {
    test.only("should get the last burn tx for a given address", async function () {
        const burnTxHash =
            "0x0f7373fb7424b800b410646c71ef9bab95cc2b3c9440650e48de081fc5da0419";
        const result = await isBurnTxClaimable(
            rootChainProvider,
            provider,
            rootChainContractAddress,
            burnTxHash,
            ERC20_TRANSFER_EVENT_SIG,
        );
        expect(result).toBe(true);
    });
});
