const { provider } = require('./getProvider')
const { getAllTransfers } = require('./eventScraper')
const { Pool } = require('pg')
require('dotenv').config()

const connectionString = process.env.DB_URI
const pool = new Pool({ connectionString })
  
async function main(blockNumber){
    client = await pool.connect()
    await client.query('DROP TABLE IF EXISTS transfers')
    await client.query('CREATE TABLE IF NOT EXISTS transfers (data jsonb);')
    
    console.log(blockNumber)
    transfers = await getAllTransfers(blockNumber)
    if(transfers.length > 0){
        console.log("Found %d transfers", transfers.length)
        //console.log("Preview: ", transfers[0])
        for(let i=0; i<transfers.length;i++) {  
            let t = transfers[i]
            await client.query('INSERT INTO transfers (data) VALUES ($1);', [JSON.stringify(t)])
        }
    } else {
        console.log("No transfers found on block: %d", blockNumber)
    }
    let result = await client.query('SELECT * FROM transfers;')
    console.log("%d rows in transfers", result.rows.length)
    //console.log(result.rows[0], result.rows[1])
}
/*
provider.getBlockNumber().then(blockNumber => {
    main(blockNumber)
})
*/
provider.on("block", (blockNumber) => {
    main(blockNumber)
})
