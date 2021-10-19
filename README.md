# Universe DataScraper

### The DataScraper is a component within the Universe Marketplace Backend that acts as middleware between the ethereum blockchain and the Universe Backend. 

Features in the DataScraper include firing events on:
* NFT Transfers
     * ERC721 Transfers
     * ERC1155 Single Transfers
     * ERC1155 Batch Transfers
* NFT Mints - Transfers from address(0)
* NFT Burns - Transfers to address(0)
* NFT Contract Deployments

Notes: 
* Monitoring for new NFT contract deployments is tricky... it may be best to treat all transfers as contract deployments if the contract has not yet been indexed into our db
* The high level driver should monitor for new blocks, but should only process data after 6-12? block confirmations
* On each block a list of events for each feature should processed, and forward to the relevant microservices to make further use of these events e.g. scraping the nfts in a new contract, canceling a listing if it is transferred out of the users wallet, etc 
