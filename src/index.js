const { provider } = require('./getProvider')
const { getAllTransfers } = require('./eventScraper')

async function main(blockNumber){
    console.log(blockNumber)
    transfers = await getAllTransfers(blockNumber)
    if(transfers.length > 0){
        console.log("Found %d transfers", transfers.length)
        console.log("Preview: ", transfers[0])
    } else {
        console.log("No transfers found on block: %d", blockNumber)
    }
}
/*
provider.getBlockNumber().then(blockNumber => {
    main(blockNumber)
})
*/
provider.on("block", (blockNumber) => {
    main(blockNumber)
})
