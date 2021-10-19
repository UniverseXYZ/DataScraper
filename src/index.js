const { provider } = require('./getProvider.js')
const {
    get721Transfers,
    get1155BatchTransfers,
    get1155SingleTransfers
} = require('./transferQueries.js')

async function main(blockNumber){
    console.log(blockNumber)

    erc721Transfers = await get721Transfers(blockNumber)
    if(erc721Transfers.length) console.log("721: ", erc721Transfers[0])
    
    erc1155Transfers = await get1155SingleTransfers(blockNumber)
    if(erc1155Transfers.length) console.log("1155 (single): ", erc1155Transfers[0])
    
   erc1155TransfersBatch = await get1155BatchTransfers(blockNumber)
   if(erc1155TransfersBatch.length) console.log("1155 (batch): ", erc1155TransfersBatch[0])
}

provider.on("block", (blockNumber) => {
    main(blockNumber)
})