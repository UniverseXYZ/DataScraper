const { ethers } = require("ethers")
const { provider } = require('./getProvider.js')
const fetch = require('node-fetch');
require('dotenv').config()

async function getContractCreationBlock(address, blockNumber){
    try {
        const response = await fetch("https://api.etherscan.io/api\?module=account\&action=txlist\&address=" + address +"\&startblock=0\&endblock=" + blockNumber +"\&page=1\&offset=1\&sort=asc\&apikey=" + process.env.ETHERSCAN_API_KEY)
        const json = await response.json()
        return parseInt(json['result'][0]['blockNumber'])
      } catch (error) {
        console.log(error.response.body);
        return 0
      }    
}

async function indexERC721(address, blockNumber){
    event_signature = ethers.utils.id("Transfer(address,address,uint256)")
    fromBlock = await getContractCreationBlock(address, blockNumber)
    transfers = []
    while(fromBlock < blockNumber){
        logs = await provider.getLogs({
            "fromBlock": fromBlock,
            "toBlock": fromBlock + 1000,
            "address": address,
            "topics": [event_signature]
        })
        transfers.push(logs)
        fromBlock = fromBlock + 1000 
        console.log(blockNumber-fromBlock)
    }
    return transfers
}

module.exports.indexERC721 = indexERC721
