var noClientError = function(){
    $("#before_load").html("<h1>Could not find ethereum client</h1>");
    alert("Could not find ethereum client");
    return -1;
};


window.addEventListener('load', function() {
// must have:
// instructions
// change contract to give only half profit
// do about - write github md 
    
//function init() {
    // Checks Web3 support
    
    if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
        // If there's a web3 library loaded, then make your own web3
        web3 = new Web3(web3.currentProvider);

    } else if (typeof Web3 !== 'undefined') {
        // If there isn't then set a provider
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        if( ! web3.isConnected()) return noClientError();
    } else{
        return noClientError();
    
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
    globalWeb3.eth.getBlock(0, function(err, result){
        if( err ) return HandleError(err);
        if( result.hash.toString() === "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3" ){
            // live
            contractAddress = contractAddressMainnet;
        }
        else if( result.hash.toString() === "0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303"){
            // testnet
            contractAddress = contractAddressTestnet;
        }

        globalContractInstance = simplemixerContract.at(contractAddress);
        var page = location.pathname.split("/").slice(-1);
        if( page.toString() === "index.html" || page.toString() === ""){            
             myDealsPage();
        }
        else if( page.toString() === "alldeals.html" ){
            allDealsPage();
        }                        
    });        
});