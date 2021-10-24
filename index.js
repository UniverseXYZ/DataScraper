const { provider } = require('./getProvider')
const { getAllTransfers } = require('./eventScraper')
const { Pool } = require('pg')
require('dotenv').config()

const connectionString = process.env.DB_URI
const pool = new Pool({ connectionString })
let client

async function initDB(drop=false){
    if(drop) await client.query('DROP TABLE IF EXISTS transfers')
    await client.query(`
    CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL,
        data jsonb NOT NULL,
        fromAddr   TEXT GENERATED ALWAYS AS (data ->> 'from') stored,
        toAddr      TEXT GENERATED ALWAYS AS (data ->> 'to')   stored,
        tokenAddr   TEXT GENERATED ALWAYS AS (data ->> 'address') stored,
        tokenId     TEXT GENERATED ALWAYS AS (data ->> 'tokenId') stored,
        amount      TEXT GENERATED ALWAYS AS (data ->> 'amount') stored,
        logIndex    TEXT GENERATED ALWAYS AS (data ->> 'logIndex') stored,
        txHash      TEXT GENERATED ALWAYS AS (data ->> 'transactionHash') stored,
        PRIMARY     KEY (txHash, logIndex, tokenId)
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
            await client.query('INSERT INTO transfers (data) VALUES ($1);', [JSON.stringify(t)])
        } catch (e) {}
    }
}

async function scrape(blockNumber){
    blockNumber = blockNumber - 6
    console.log("Block: %d", blockNumber)
    transfers = await getAllTransfers(blockNumber)
    if(transfers.length > 0){
        console.log("Found %d transfers", transfers.length)
        //console.log("Preview: ", transfers[0])
        await storeTransfers(transfers)
    } else {
        console.log("No transfers found on block: %d", blockNumber)
    }
    let result = await client.query('SELECT * FROM transfers;')
    console.log("%d rows in transfers", result.rows.length)
    //console.log(result.rows[result.rows.length-1])
}
/*
provider.getBlockNumber().then(blockNumber => {
    main(blockNumber)
})
*/
async function main(){
    client = await pool.connect()
    await initDB(true)
    provider.on("block", (blockNumber) => {
        scrape(blockNumber)
    })    
}

main()