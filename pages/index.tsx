import Head from "next/head";
import { useState } from "react";
import {
    isBurnTxClaimable,
    ERC20_TRANSFER_EVENT_SIG,
} from "@tomfrench/matic-proofs";
import styles from "../styles/Home.module.scss";
import { getLastBurnTxHash, USDCFormat } from "../utils";
import {
    rootChainContractAddress,
    rootChainProvider,
    provider,
} from "../utils/constants";
import PolymarketLogo from "../public/polymarket.svg";

const CheckpointChecker: React.FC = (): JSX.Element => {
    const [address, setAddress] = useState<string>("");
    const [isTxClaimable, setIsTxClaimable] = useState<boolean | undefined>(
        undefined,
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleClick = async (event: {
        preventDefault: () => void;
    }): Promise<void> => {
        try {
            event.preventDefault();
            setIsTxClaimable(undefined);
            setErrorMessage("");
            setLoading(true);
            const transactionValues = await getLastBurnTxHash(address);
            const result = await isBurnTxClaimable(
                rootChainProvider,
                provider,
                rootChainContractAddress,
                transactionValues[0],
                ERC20_TRANSFER_EVENT_SIG,
            );
            setLoading(false);
            setIsTxClaimable(result);
            setValue(USDCFormat(transactionValues[1]));
        } catch (error) {
            setErrorMessage(error.message);
        }
    };
    const displayMessage = (): JSX.Element => {
        if (isTxClaimable === true) {
            return (
                <p className={styles.description}>
                    Your withdrawal of {value} USDC is now available
                </p>
            );
        }
        if (isTxClaimable === false) {
            return (
                <p className={styles.description}>
                    Your withdrawal of {value} USDC is not yet available or has
                    been withdrawn
                </p>
            );
        }
        return null;
    };

    return (
        <div className={styles.App_Container}>
            <Head>
                <title>PM Withdrawal Checker</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.header}>
            <div className={styles.content}>
               
                        <PolymarketLogo />
                    
            \
                </div>
                </div>

            <main className={styles.main}>
                <h1 className={styles.title}>Withdrawal checkpoint checker</h1>

                <div className={styles.grid}>
                    <form className={styles.form}>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            className={styles.input}
                        />
                        <div className={styles.grid}>
                            <button
                                onClick={handleClick}
                                className={styles.button}
                            >
                                Submit
                            </button>
                        </div>
                        <div className={styles.grid}>
                            {loading && <h5>Loading</h5>}
                            {displayMessage()}
                        </div>
                        <div className={styles.grid}>
                            {errorMessage && <h5>{errorMessage}</h5>}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CheckpointChecker;
