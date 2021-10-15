const { ethers } = require("ethers");
const fs = require('fs');
require('dotenv').config()

const NODE = process.env.NODE;
const PROVIDER = new ethers.providers.JsonRpcProvider(NODE);

async function get721Transfers(blockNumber){
    let rawabi = fs.readFileSync('./abi/ERC721.json');
    let abi = JSON.parse(rawabi).abi;    
    var iface = new ethers.utils.Interface(abi)
    event_signature = ethers.utils.id("Transfer(address,address,uint256)")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    events = []
    for(let i = 0; i < logs.length; i++){
        txLog = logs[i]
        topics = txLog['topics']
        data = txLog.data
        if (topics.length == 4 && parseInt(topics[1], 16) != 0){
            var result = iface.decodeEventLog("Transfer", data, topics)
            console.log(result)
            events.push({
                contract: txLog.address,
                tokenId: parseInt(result.tokenId._hex),
                from: result.from,
                to: result.to
            })
        }
    }
    return events
}

async function get1155SingleTransfers(blockNumber){
    // TransferSingle(address operator, address from, address to, uint256 id, uint256 value)
    let rawabi = fs.readFileSync('./abi/ERC1155.json');
    let abi = JSON.parse(rawabi).abi;    
    var iface = new ethers.utils.Interface(abi)
    event_signature = ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    events = []
    for(let i = 0; i < logs.length; i++){
        txLog = logs[i]
        topics = txLog['topics']
        data = txLog.data
        var result = iface.decodeEventLog("TransferSingle", data, topics)
        if (parseInt(result.from, 16) != 0){
            events.push({
                contract: txLog.address,
                operator: result.operator,
                from: result.from,
                to: result.to,
                id: parseInt(result.id._hex, 16),
                amount: parseInt(result.amount._hex, 16)
            })
        }
    }
    return events
}

async function main(blockNumber){
    console.log(blockNumber)
    erc721Transfers = await get721Transfers(blockNumber)
    if(erc721Transfers.length) console.log("721s: ", erc721Transfers);
    erc1155Transfers = await get1155SingleTransfers(blockNumber)
    if(erc1155Transfers.length) console.log("1155 (single): ", erc1155Transfers);
}

PROVIDER.on("block", (blockNumber) => {
    main(blockNumber)
})
