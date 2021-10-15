const { ethers } = require("ethers");
const AWSHttpProvider = require('@aws/web3-http-provider');
const fs = require('fs');
require('dotenv').config()

const node = process.env.AMB_HTTP_ENDPOINT;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

const baseProvider = new AWSHttpProvider(node, credentials)
const PROVIDER = new ethers.providers.Web3Provider(baseProvider);

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

async function get1155BatchTransfers(blockNumber){
    // TransferBatch(address operator, address from, address to, uint256 id, uint256[] values)
    let rawabi = fs.readFileSync('./abi/ERC1155.json');
    let abi = JSON.parse(rawabi).abi;    
    var iface = new ethers.utils.Interface(abi)
    event_signature = ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    events = []
    for(let i = 0; i < logs.length; i++){
        txLog = logs[i]
        topics = txLog['topics']
        data = txLog.data
        var result = iface.decodeEventLog("TransferBatch", data, topics)
        if (parseInt(result.from, 16) != 0){
            events.push({
                contract: txLog.address,
                operator: result.operator,
                from: result.from,
                to: result.to,
                ids: result.ids.map(x => parseInt(x, 16)),
                amounts: result.amounts.map(x => parseInt(x, 16))
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
    
    erc1155TransfersBatch = await get1155BatchTransfers(blockNumber)
    if(erc1155TransfersBatch.length) console.log("1155 (batch): ", erc1155TransfersBatch);

}

PROVIDER.on("block", (blockNumber) => {
    main(blockNumber)
})
