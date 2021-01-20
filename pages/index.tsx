import Head from 'next/head'
import styles from '../styles/Home.module.css';
import { ethers } from "ethers";
import { useState } from 'react';


const MATIC_NODE: string = "https://rpc-mainnet.maticvigil.com/v1/033be9d85736f034304850e435a58027165ddf1e";
const provider = new ethers.providers.JsonRpcProvider(MATIC_NODE);


const CheckpointChecker: React.FC = (): JSX.Element => {
  const [address, setAddress] = useState<string>("");

const handleClick = event => {
  event.preventDefault();
//getTransactionsByAccount("0x822276EB1df687f4faB5D29adA0d30590C510311");
getBlockWithTransactions();
//getTokenTransactions()
}  
async function getTransactionsByAccount(myaccount: string) : Promise<void>
  
{
    
    const endBlockNumber =  9800499;
    console.log("Using endBlockNumber: " + endBlockNumber);
  
 
    const startBlockNumber = endBlockNumber - 10000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  for (var i = endBlockNumber; i >= startBlockNumber; i--) {
  
      console.log("Searching block " + i);
    
    var block = await provider.getBlockWithTransactions(i);
    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e: any) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          console.log("  tx hash          : " + e.hash + "\n"
            + "   nonce           : " + e.nonce + "\n"
            + "   blockHash       : " + e.blockHash + "\n"
            + "   blockNumber     : " + e.blockNumber + "\n"
            + "   transactionIndex: " + e.transactionIndex + "\n"
            + "   from            : " + e.from + "\n" 
            + "   to              : " + e.to + "\n"
            + "   value           : " + e.value + "\n"
            + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toUTCString() + "\n"
            + "   gasPrice        : " + e.gasPrice + "\n"
            + "   gas             : " + e.gas + "\n"
            + "   input           : " + e.input);
        }
      })
    }
  }
}
const getBlockWithTransactions = async () => {
  console.log(await provider.getBlockWithTransactions(9800498))
}
const getTokenTransactions = async () => {
  const res = fetch("https://explorer-mainnet.maticvigil.com/api/?module=account&action=tokentx&address=0x822276EB1df687f4faB5D29adA0d30590C510311",
  {
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin':'*'
    }
  })
   console.log(res)

}
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
  
      <main className={styles.main}>
        <h1 className={styles.title}>
          Withdrawal checkpoint checker
        </h1>

      
        <div className={styles.grid}>
          <form>
       
           
            <button onClick={handleClick} style={{height:"30px", width:"60px"}} />
          </form>

         
        </div>
      </main>

  
    </div>
  )
}


export default CheckpointChecker