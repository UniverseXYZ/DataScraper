const { ethers } = require("ethers")
const { provider } = require('./getProvider.js')
const { decodeTransferEvents } = require('./transferDecoder.js')
const fs = require('fs')

const ERC721_ABI = JSON.parse(fs.readFileSync('./abi/ERC721.json')).abi
const ERC1155_ABI = JSON.parse(fs.readFileSync('./abi/ERC1155.json')).abi
const IFACE_721 = new ethers.utils.Interface(ERC721_ABI)
const IFACE_1155 = new ethers.utils.Interface(ERC1155_ABI)

async function get721Transfers(blockNumber){
    // Transfer(address from, address to, uint256 id)
    event_signature = ethers.utils.id("Transfer(address,address,uint256)")
    logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeTransferEvents(logs, IFACE_721, "Transfer", 4)
}

async function get1155SingleTransfers(blockNumber){
    // TransferSingle(address operator, address from, address to, uint256 id, uint256 value)
    var iface = new ethers.utils.Interface(ERC1155_ABI)
    event_signature = ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)")
    logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeTransferEvents(logs, IFACE_1155, "TransferSingle", 4)
}

async function get1155BatchTransfers(blockNumber){
    // TransferBatch(address operator, address from, address to, uint256 id, uint256[] values)
    var iface = new ethers.utils.Interface(ERC1155_ABI)
    event_signature = ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")
    logs = await provider.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeTransferEvents(logs, IFACE_1155, "TransferBatch", 4)
}

module.exports.get721Transfers = get721Transfers
module.exports.get1155SingleTransfers = get1155SingleTransfers
module.exports.get1155BatchTransfers = get1155BatchTransfers