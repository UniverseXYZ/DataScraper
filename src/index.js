const { provider } = require('./getProvider')
const { get721Transfers, get1155Transfers } = require('./eventScraper')

async function main(blockNumber){
    console.log(blockNumber)
    logs721 = await get721Transfers(blockNumber)
    console.log(logs721)
    logs1155 = await get1155Transfers(blockNumber)
    console.log(logs1155)
}

provider.on("block", (blockNumber) => {
    main(blockNumber)
})
