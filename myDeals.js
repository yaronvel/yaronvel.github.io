var myDealsPage = function(){
    $("#my_deals_div").show();
        
    $("#before_load").hide();
    $("#after_load").hide();
    $("#active_deals_title").html("<a>Active Deals</a>: " + claimSizeInEther.toString() + " Ether deposit, " +
        depositSizeInEther.toString() + " Ether collateral");
        
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


