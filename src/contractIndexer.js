const { ethers } = require("ethers")
const { provider } = require('./getProvider.js')
const fetch = require('node-fetch');
const fs = require('fs')
const ERC721_ABI = JSON.parse(fs.readFileSync('./abi/ERC721.json')).abi
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
    let fromBlock = await getContractCreationBlock(address, blockNumber)
    let contract = new ethers.Contract(address, ERC721_ABI, provider);
    let totalSupply = parseInt((await contract.totalSupply())._hex)
    console.log("Indexing address: ", address)
    console.log("Total supply: ", totalSupply)

    transfers = []
    while(fromBlock < blockNumber){
        logs = await provider.getLogs({
            "fromBlock": fromBlock,
            "toBlock": fromBlock + 999,
            "address": address,
            "topics": [event_signature, "0x0000000000000000000000000000000000000000000000000000000000000000"]
        })
        transfers = transfers.concat(logs)
        fromBlock = fromBlock + 1000
        if(totalSupply == transfers.length) break;
    }
    return transfers
}

module.exports.indexERC721 = indexERC721
