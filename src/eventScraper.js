const { ethers } = require("ethers")
const { provider } = require('./getProvider.js')
const fs = require('fs')

const ERC721_ABI = JSON.parse(fs.readFileSync('./abi/ERC721.json')).abi
const ERC1155_ABI = JSON.parse(fs.readFileSync('./abi/ERC1155.json')).abi
const IFACE_721 = new ethers.utils.Interface(ERC721_ABI)
const IFACE_1155 = new ethers.utils.Interface(ERC1155_ABI)

function devodeEventLogs(method, logs, iface){
    return logs.map(function(l) {
        var log = Object.assign({}, l)
        let decodedEvent = iface.decodeEventLog(method, log.data, log.topics)
        log.type = method
        log.from = decodedEvent.from
        log.to = decodedEvent.to
        switch(method) {
            case "TransferSingle":
                log.tokenId = parseInt(decodedEvent.id._hex, 16)
                log.amount = parseInt(decodedEvent.amount._hex, 16)
                break;
            case "TransferBatch":
                log.tokenId = decodedEvent.ids.map(id => parseInt(id._hex, 16));
                log.amount =  decodedEvent.amounts.map(amount => parseInt(amount._hex, 16))
                break;
            case "Transfer":
                log.tokenId = parseInt(decodedEvent.tokenId._hex, 16)
                log.amount = 1
                break;
        }
        return log
    });
}

function splitBatch1155Logs(logs){
    ls = []
    logs.forEach(function(l){
        for(let i = 0; i < l.tokenId.length; i++){
            var log = Object.assign({}, l)
            log.tokenId = log.tokenId[i]
            log.amount = log.amount[i]
            ls.push(log)
        }
    });
    return ls
}

async function get721Transfers(blockNumber){
    // Transfer(address from, address to, uint256 id)
    let logs = (await provider.getLogs({
        "fromBlock": blockNumber,
        "toBlock": blockNumber,
        "topics": [ethers.utils.id("Transfer(address,address,uint256)")]
    })).filter(function(log){ return log.topics.length == 4 })
    logs = devodeEventLogs("Transfer", logs, IFACE_721)
    return logs
}

async function get1155Transfers(blockNumber){
    let singleTransfers = await get1155SingleTransfers(blockNumber)
    let batchTransfers = await get1155BatchTransfers(blockNumber)
    let logs = singleTransfers.concat(batchTransfers)
    return logs
}

async function get1155SingleTransfers(blockNumber){
    // TransferSingle(address operator, address from, address to, uint256 id, uint256 value)
    let logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "toBlock": blockNumber,
        "topics": [ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)")]
    })
    logs = devodeEventLogs("TransferSingle", logs, IFACE_1155)
    return logs
}

async function get1155BatchTransfers(blockNumber){
    // TransferBatch(address operator, address from, address to, uint256 id, uint256[] values)
    let logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "toBlock": blockNumber,
        "topics": [ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")]
    })
    logs = devodeEventLogs("TransferBatch", logs, IFACE_1155)
    logs = splitBatch1155Logs(logs)
    return logs
}

module.exports.get721Transfers = get721Transfers
module.exports.get1155Transfers = get1155Transfers
