const { ethers } = require("ethers")
const { decodeEvents } = require('./decoder.js')
const AWSHttpProvider = require('@aws/web3-http-provider')
const fs = require('fs')
require('dotenv').config()

const ERC721_ABI = JSON.parse(fs.readFileSync('./abi/ERC721.json')).abi
const ERC1155_ABI = JSON.parse(fs.readFileSync('./abi/ERC1155.json')).abi
const IFACE_721 = new ethers.utils.Interface(ERC721_ABI)
const IFACE_1155 = new ethers.utils.Interface(ERC1155_ABI)

const node = process.env.AMB_HTTP_ENDPOINT;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

const baseProvider = new AWSHttpProvider(node, credentials)
const PROVIDER = new ethers.providers.Web3Provider(baseProvider)

async function get721Transfers(blockNumber){
    event_signature = ethers.utils.id("Transfer(address,address,uint256)")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeEvents(logs, IFACE_721, "Transfer", 4)
}

async function get1155SingleTransfers(blockNumber){
    // TransferSingle(address operator, address from, address to, uint256 id, uint256 value)
    var iface = new ethers.utils.Interface(ERC1155_ABI)
    event_signature = ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeEvents(logs, IFACE_1155, "TransferSingle", 4)
}

async function get1155BatchTransfers(blockNumber){
    // TransferBatch(address operator, address from, address to, uint256 id, uint256[] values)
    var iface = new ethers.utils.Interface(ERC1155_ABI)
    event_signature = ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])")
    logs = await PROVIDER.getLogs({
        "fromBlock": blockNumber,
        "topics": [event_signature]
    })
    return decodeEvents(logs, IFACE_1155, "TransferBatch", 4)
}

async function main(blockNumber){
    console.log(blockNumber)

    erc721Transfers = await get721Transfers(blockNumber)
    if(erc721Transfers.length) console.log("721s: ", erc721Transfers[0])
    
    erc1155Transfers = await get1155SingleTransfers(blockNumber)
    if(erc1155Transfers.length) console.log("1155 (single): ", erc1155Transfers[0])
    
   erc1155TransfersBatch = await get1155BatchTransfers(blockNumber)
   if(erc1155TransfersBatch.length) console.log("1155 (batch): ", erc1155TransfersBatch[0])
}

PROVIDER.on("block", (blockNumber) => {
    main(blockNumber)
})
