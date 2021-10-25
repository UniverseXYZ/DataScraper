import { useState, useEffect } from 'react';
import './App.css'

function App() {
  const [transfers, setTransfers] = useState(null);

  // we will use async/await to fetch this data
  useEffect(() => {
    getTransfers()
    const interval = setInterval(() => {
      console.log('Getting Transfers!');
      getTransfers()
    }, 3000); 
    async function getTransfers() {
      const res = await fetch("http://localhost:3000/transfers");
      const data = await res.json();
      setTransfers(data) ;
    }
    return () => clearInterval(interval);
  },[setTransfers])

  if(transfers){
    console.log(transfers[0])
  }
  
  return (
    <>
      <div><h1>NFT Transfers</h1></div>
      <table class="table table-striped">
      <thead>
          <tr>
          <th>Id</th>
          <th>From</th>
          <th>To</th>
          <th>Contract</th>
          <th>TokenId</th>
          <th>Amount</th>
          <th>TxHash</th>
          <th>Block</th>
          </tr>
      </thead>
      <tbody>
    {transfers ? transfers.map(
        (info)=>{
            return(
                <tr>
                    <td>{info.id}</td>
                    <td>{info.fromaddr.substring(0,8)}</td>
                    <td>{info.toaddr.substring(0,8)}</td>
                    <td>{info.tokenaddr.substring(0,8)}</td>
                    <td>{info.tokenid.substring(0,8)}</td>
                    <td>{info.amount.substring(0,8)}</td>
                    <td><a href={"https://etherscan.com/tx/" + info.txhash}>{info.txhash.substring(0,8)}</a></td>
                    <td>{info.block}</td>
                </tr>
            )
        }
    ) : <p>loading..</p>}
                    </tbody>
            </table>
    </>
  )
}

export default App