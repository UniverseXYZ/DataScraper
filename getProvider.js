const { ethers } = require("ethers")
require('dotenv').config()

function getProvider(){
    return new ethers.providers.JsonRpcBatchProvider(process.env.HTTP_ENDPOINT)
}

module.exports.provider = getProvider()
