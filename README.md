# Universe DataScraper

### The DataScraper is a component within the Universe Marketplace Backend that acts as middleware between the ethereum blockchain and the Universe Backend. 

Run the beta with: `docker-compose build && docker-compose up`

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
* New contract indexer must query all mints first, in order to deterimine which tokenIds exist - some collections are 1 to 10,000, but we can not assume that is always the case!

Flows:
* New NFT Contract
    * Catch transfer events matching addresses not in our db
    * Get block contract was created at (via etherscan api)
    * Store name and ticker of collection in database
    * Index all transfer events from creation block to now
* New NFT Transfers
    * Catch transfer events matching assets listed for sale in the db
    * Check if transfer is from a matched order
    * Cancel listing and mark as completed or invalidated
* New NFT Mints
    * Catch transfer events coming from address(0)
    * Retreive assets tokenURI and store in db (name, description, properties, etc)
    * Process asset media into 3 resolutions (full, high, and low), and upload asset to CDN
