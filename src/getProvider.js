const { ethers } = require("ethers")
const AWSHttpProvider = require('@aws/web3-http-provider');
require('dotenv').config()

function getProvider(){
    const node = process.env.AMB_HTTP_ENDPOINT;
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
    const baseProvider = new AWSHttpProvider(node, credentials)
    const provider = new ethers.providers.Web3Provider(baseProvider)
    return provider
}

module.exports.getProvider = getProvider
module.exports.provider = getProvider()

