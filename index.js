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

async function get1155SingleTransfers(blockNumber){
    // TransferSingle(address operator, address from, address to, uint256 id, uint256 value)
    var abi = [{
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "TransferSingle",
        "type": "event"
      }]      
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
                value: parseInt(result.value._hex, 16)
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
