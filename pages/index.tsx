import Head from "next/head";
import { useState } from "react";
import {
    isBurnTxClaimable,
    ERC20_TRANSFER_EVENT_SIG,
} from "@tomfrench/matic-proofs";
import styles from "../styles/Home.module.css";
import { getLastBurnTxHash,
         USDCFormat } from "../utils";
import {
    rootChainContractAddress,
    rootChainProvider,
    provider,
} from "../utils/constants";

const CheckpointChecker: React.FC = (): JSX.Element => {
    const [address, setAddress] = useState<string>("");
    const [result, setResult] = useState<boolean | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [ value, setValue ] = useState<string>("");
    const [errorMessage, setErrorMessage ] = useState<string>("");
 
    const handleClick = async (event): Promise<void> => {
       try {
        event.preventDefault();
        setResult(undefined);
        setErrorMessage("");
        setLoading(true);
        const transactionValues = await getLastBurnTxHash(address);
        const _result = await isBurnTxClaimable(
            rootChainProvider,
            provider,
            rootChainContractAddress,
            transactionValues[0],
            ERC20_TRANSFER_EVENT_SIG,
        );
        setLoading(false);
        setResult(_result);
        setValue(USDCFormat(transactionValues[1]));
       } catch(error) {
         setErrorMessage(error.message);
       }
   
    };
    const displayMessage = (): JSX.Element => {
        if (result === true) {
            return <h5>Your withdrawal of {value} USDC is now available</h5>;
        }
        if (result === false) {
            return <h5>Your withdrawal of {value} USDC is not yet available or has been withdrawn</h5>;
        }
        return <h5 />;
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>PM Withdrawal Checker</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Withdrawal checkpoint checker</h1>

                <div className={styles.grid}>
                    <form>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            style={{ width: "350px", height: "30px" }}
                        />
                        <div
                            style={{ textAlign: "center", paddingTop: "15px" }}
                        >
                            <button
                                onClick={handleClick}
                                style={{ height: "30px", width: "60px" }}
                            >
                                Submit
                            </button>
                        </div>
                        <div
                            style={{ textAlign: "center", paddingTop: "15px" }}
                        >
                            {loading && <h5>Loading</h5>}
                            {displayMessage()}
                        </div>
                        <div
                            style={{ textAlign: "center", paddingTop: "15px" }}
                        >
                            {errorMessage && <h5>{errorMessage}</h5>}
                         
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CheckpointChecker;