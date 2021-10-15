const { ethers } = require("ethers");
require('dotenv').config()

const NODE = process.env.NODE;
const PROVIDER = new ethers.providers.JsonRpcProvider(NODE);

async function get721Transfers(blockNumber){
    event_signature = ethers.utils.id("Transfer(address,address,uint256)")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    events = []
    for(let i = 0; i < logs.length; i++){
        txLog = logs[i]
        topics = txLog['topics']
        if (topics.length == 4 && parseInt(topics[1], 16) != 0){
            events.push({
                contract: txLog.address,
                tokenId: parseInt(topics[3], 16),
                from: topics[1],
                to: topics[2]
            })
        }
    }
    return events
}

async function main(blockNumber){
    console.log(blockNumber)
    erc721Transfers = await get721Transfers(blockNumber)
    if(erc721Transfers.length) console.log(erc721Transfers);
}

PROVIDER.on("block", (blockNumber) => {
    main(blockNumber)
})
