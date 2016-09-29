window.addEventListener('load', function() {
    
    
//function init() {
    // Checks Web3 support
    if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
        // If there's a web3 library loaded, then make your own web3
        web3 = new Web3(web3.currentProvider);

    } else if (typeof Web3 !== 'undefined') {
        // If there isn't then set a provider
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    } else if(typeof web3 == 'undefined' && typeof Web3 == 'undefined') {
        // If there is neither then this isn't an ethereum browser
        document.getElementById("results").style.display = "none";
        document.getElementById("see-results").style.display = "none";
        document.getElementById("vote-support").style.display = "none";
        document.getElementById("vote-against").style.display = "none";
        document.getElementById("subtitle").style.display = "none";
        document.getElementById("proposal").textContent = "Give Stakers a Voice";
        var message = document.getElementById("message");
        message.style.display = "block";
        return;    
    }
    globalWeb3 = web3;
    
    var simplemixerContract = web3.eth.contract(contractABI);
    globalContractInstance = simplemixerContract.at(contractAddressTestnet);
    
    var page = location.pathname.split("/").slice(-1);
    if( page.toString() === "index.html" || page.toString() === ""){
         myDealsPage();
    }
    else if( page.toString() === "alldeals.html" ){
        allDealsPage();
    }
});