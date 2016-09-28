window.addEventListener('load', function() {
    $("#before_load").hide();
    $("#after_load").hide();
    $("#active_deals_title").html("<a>Active Deals</a>: " + claimSizeInEther.toString() + " Ether deposit, " +
        depositSizeInEther.toString() + " Ether collateral");
    
    
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
    
    var accounts = web3.eth.accounts;

    $('#secret_address').append($('<option>', {value: -1, text: "Select your secret account"}));    
    $('#public_address').append($('<option>', {value: -1, text: "Select your public account"}));
        
    for( var i = 0 ; i < accounts.length ; i++ ){
    	$('#secret_address').append($('<option>', {value: i, text: accounts[i].toString()}));
        $('#public_address').append($('<option>', {value: i, text: accounts[i].toString()}));    	
    }
    
    $('#secret_address').val(-1);    
    $('#public_address').val(-1);    
    
    $('#secret_address').on('change', selectAccountChange);
    $('#public_address').on('change', selectAccountChange);
});