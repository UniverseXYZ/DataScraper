// Decodes 721 & 1155 transfer events 
function decodeTransferEvents(logs, iface, methodName, topicLength){
    events = []
    for(let i = 0; i < logs.length; i++){
        topics = logs[i]['topics']
        data = logs[i]['data']
        if (topics.length == topicLength){
            var result = iface.decodeEventLog(methodName, data, topics)
            switch(methodName){
                case "Transfer":
                    events.push({
                        contract: logs[i].address,
                        tokenId: parseInt(result.tokenId._hex),
                        from: result.from,
                        to: result.to
                    }) 
                    break
                case "TransferSingle":
                    events.push({
                        contract: logs[i].address,
                        operator: result.operator,
                        from: result.from,
                        to: result.to,
                        id: parseInt(result.id._hex, 16),
                        amount: parseInt(result.amount._hex, 16)
                    })
                    break
                case "TransferBatch":
                    events.push({
                        contract: logs[i].address,
                        operator: result.operator,
                        from: result.from,
                        to: result.to,
                        ids: result.ids.map(x => parseInt(x, 16)),
                        amounts: result.amounts.map(x => parseInt(x, 16))
                    })
                    break
            }
        }
    }
    return events;
}

module.exports.decodeTransferEvents = decodeTransferEvents;
