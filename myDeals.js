var myDealsPage = function(){
    $("#my_deals_div").show();        
    $("#before_load").hide();
    $("#after_load").hide();
    var currency = etc ? "ETC" : "ETH";
    $("#active_deals_title").html("<a>Active Deals</a><span style = \"display: block;\">" + claimSizeInEther.toString() + " " + currency + " deposit &nbsp;" +
        depositSizeInEther.toString() + " " + currency + " collateral &nbsp; Each phase takes " + dealDefaultParams._claimDurationInHours.toString() + " hours</span>");
        
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
};







