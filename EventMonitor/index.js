const { provider } = require('./getProvider')
const { providers } = require('@0xsequence/multicall')
const { ethers } = require('ethers')
const { getAllTransfers } = require('./eventScraper')
const { Pool } = require('pg')
const r2 = require("r2");

require('dotenv').config()

const connectionString = process.env.DB_URI
const pool = new Pool({ connectionString })
let client

async function initDB(drop=false){
    if(drop) await client.query('DROP TABLE IF EXISTS transfers')
    if(drop) await client.query('DROP TABLE IF EXISTS nfts')
    await client.query(`
    CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL,
        data jsonb NOT NULL,
        fromAddr    TEXT GENERATED ALWAYS AS (data ->> 'from') stored,
        toAddr      TEXT GENERATED ALWAYS AS (data ->> 'to')   stored,
        tokenAddr   TEXT GENERATED ALWAYS AS (data ->> 'address') stored,
        tokenId     varchar(200) GENERATED ALWAYS AS (data ->> 'tokenId') stored,
        amount      TEXT GENERATED ALWAYS AS (data ->> 'amount') stored,
        logIndex    TEXT GENERATED ALWAYS AS (data ->> 'logIndex') stored,
        txHash      TEXT GENERATED ALWAYS AS (data ->> 'transactionHash') stored,
        block       INTEGER GENERATED ALWAYS AS ((data ->> 'blockNumber')::int) stored,
        PRIMARY     KEY (txHash, logIndex, tokenId)
    );`
    )
    await client.query(`
    CREATE TABLE IF NOT EXISTS nfts (
        id SERIAL,
        data jsonb NOT NULL,
        metadata jsonb,
        owner       TEXT GENERATED ALWAYS AS (data ->> 'to') stored,
        tokenAddr   TEXT GENERATED ALWAYS AS (data ->> 'address') stored,
        tokenUri    TEXT GENERATED ALWAYS AS (data ->> 'tokenUri') stored,
        tokenId     varchar(200) GENERATED ALWAYS AS (data ->> 'tokenId') stored,
        PRIMARY     KEY (tokenAddr, tokenId)
    );`
    )
}

async function storeTransfers(transfers){
    for(let i=0; i<transfers.length;i++) {  
        let t = transfers[i]
        if(t.removed) continue;
        delete t.data;  
        delete t.topics;  
        delete t.removed;  
        delete t.blockHash;
        try{
            const transfers = await pool.query("SELECT * FROM transfers WHERE txHash = $1 AND logIndex = $2 AND tokenId = $3", [
                t.transactionHash, t.logIndex, t.tokenId
              ]);
            if (transfers.rows.length > 0){
                console.log(transfers.rows)
                console.log("Duplicate found!")
            } else {
                await client.query('INSERT INTO transfers (data) VALUES ($1) ON CONFLICT DO NOTHING;', [JSON.stringify(t)])
            }
        } catch (e) { console.log ( "error: ", t, e )}
    }
}


async function extractMetadata(transfers){
    console.log("%d transfers to extract", transfers.length)
    const mcProvider = new providers.MulticallProvider(provider)
    const abi = [
        "function tokenURI(uint256) view returns (string)",
        "function uri(uint256) view returns (string)",
    ]    

    tokenURICalls = []
    for( let i = 0; i < transfers.length; i++){
        t = transfers[i]
        const contract = new ethers.Contract(t.address, abi, mcProvider)
        if(t.type == "Transfer"){
            tokenURICalls.push(contract.tokenURI(t.tokenId))
        } else {
            tokenURICalls.push(contract.uri(t.tokenId))
        }
    }
    let results = await Promise.all(tokenURICalls.map(p => p.catch(e => e)));
    results = results.
        map((result) => !(result instanceof Error) ? result : "");
    for (let i = 0; i < results.length; i++){
        r = results[i]
        let protocol = r.split(':')
        console.log(protocol[0])
        if(protocol[0] == "https"){
            let md = await r2(r).json;
            console.log(md)
        }
    }
}

const timeout = 30;  
function sleep(milliseconds) {  
    return  new  Promise(resolve => 
        setTimeout(resolve, milliseconds)
    );  
}  
async function poll(fn) {  
    await fn();  
    await sleep(timeout*1000);  
    await poll(fn);  
}

async function scrape(){
    let currentBlockNumber = await provider.getBlockNumber()
    console.log("Current Block Number: %d", currentBlockNumber)
    let result = await client.query('SELECT block FROM transfers ORDER BY block DESC LIMIT 1;')
    let fromBlock =  currentBlockNumber
    if(result.rows.length){
        fromBlock = result.rows[0].block + 1
    }
    if (fromBlock > currentBlockNumber){ return }
    console.log("Scraping transfers from block %d", fromBlock)
    let transfers = await getAllTransfers(fromBlock)
    transfers.sort(function(a, b) {
        return parseFloat(a.blockNumber) - parseFloat(b.blockNumber);
    });
    
    if(transfers.length > 0){
        console.log("Found %d transfers. Storing...", transfers.length)
        await storeTransfers(transfers)
        console.log("Storing complete. Extracting Metadata...")
        await extractMetadata(transfers)
    } else {
        console.log("No transfers found on block: %d", fromBlock)
    }

    

    result = await client.query('SELECT * FROM transfers;')
    console.log("%d rows in table transfers", result.rows.length)
}

async function main(){
    client = await pool.connect()
    await initDB(true)
    poll(scrape)
}

main()