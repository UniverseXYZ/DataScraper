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
        log.decodedEvent = iface.decodeEventLog(method, log.data, log.topics)
        return log
    });
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
    return singleTransfers.concat(batchTransfers)
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
    logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "toBlock": blockNumber,
        "topics": [ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")]
    })
    logs = devodeEventLogs("TransferBatch", logs, IFACE_1155)
    return logs
}

module.exports.get721Transfers = get721Transfers
module.exports.get1155Transfers = get1155Transfers
