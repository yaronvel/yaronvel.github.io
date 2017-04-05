var myDealsPage = function(){
    
    //$("#my_deals_div").show();        
    $("#before_load").hide();
    $("#after_load").show();
    var currency = etc ? "ETC" : "ETH";
        
    var accounts = web3.eth.accounts;

    // $('#secret_address').append($('<option>', {value: -1, text: "Select your secret account"}));    
    //$('#public_address').append($('<option>', {value: -1, text: "Select your public account"}));    
    for( var i = 0 ; i < accounts.length ; i++ ){
        //$('#secret_address').append($('<option>', {value: i, text: accounts[i].toString()}));
        $('#public_address').append($('<option>', {value: i, text: accounts[i].toString()}));       
    }
    
    //$('#secret_address').val(-1);    
    //$('#public_address').val(0);    
    
    //$('#secret_address').on('change', selectAccountChange);
    //$('#public_address').on('change', selectAccountChange);
    updateDisplay();
    //updateUnsoldSellsOfUser();
};

var waitForEventConifrmFunc = function(event, tx, callback) {
    event.watch(function(err, result) {
        if (err) {
            callback(false);
            return handleError(err);
        }
        if (result.transactionHash === tx) callback(true);
        event.stopWatching(function(){});
    });
};


function sell(){
    var sender = getPublicAccount();
    $('#sell_button').html("Waiting for confirmation");
    $('#sell_button').prop('disabled', true);
    globalContractInstance.sell({from: sender, value: 30000000000000000},
        function(err, result) {
            if (err) return handleError(err);
            waitForEventConifrmFunc(globalContractInstance.Sell({seller: sender}),
                result,
                function(args) {
                    $('#sell_button').html("Sell");
                    $('#sell_button').prop('disabled', false);                                    
                    if (args) alertStatus("sell tx completed");
                    else alertStatus("sell failed");
                });
        });    
}

function buy(){
    var sender = getPublicAccount();
    $('#buy_button').html("Waiting for confirmation");
    $('#buy_button').prop('disabled', true);        
    globalContractInstance.buy({from: sender, value: 30000000000000000},
        function(err, result) {
            if (err) return handleError(err);
            waitForEventConifrmFunc(globalContractInstance.Buy({buyer: sender}),
                result,
                function(args) {
                    $('#buy_button').html("Buy");
                    $('#buy_button').prop('disabled', false);                                    
                    if (args) alertStatus("buy tx completed");
                    else alertStatus("buy failed");
                });
        });    
}


function return_chametz(){
    var sender = getPublicAccount();
    $('#return_button').html("Waiting for confirmation");
    $('#return_button').prop('disabled', true);        
    
    globalContractInstance.returnChametz({from: sender},
        function(err, result) {
            if (err) return handleError(err);
            waitForEventConifrmFunc(globalContractInstance.ReturnChametz({buyer: sender}),
                result,
                function(args) {
                    $('#return_button').html("Return Chametz");
                    $('#return_button').prop('disabled', false);                                    
                
                    if (args) alertStatus("return tx completed");
                    else alertStatus("return tx failed");
                });
        });    
}


function cancel_sell(){
    var sender = getPublicAccount();
    $('#cancel_button').html("Waiting for confirmation");
    $('#cancel_button').prop('disabled', true);        
    
    globalContractInstance.cancelSell({from: sender},
        function(err, result) {
            if (err) return handleError(err);
            waitForEventConifrmFunc(globalContractInstance.CancelSell({seller: sender}),
                result,
                function(args) {
                    $('#cancel_button').html("Cancel sell");
                    $('#cancel_button').prop('disabled', false);                                    
                
                    if (args) alertStatus("cancel sell tx completed");
                    else alertStatus("cancel tx failed");
                });
        });    
}


var updateUnsoldSellsOfUser = function( ) {
    var sender = getPublicAccount();
    globalContractInstance.sellerNumOpenDeals(sender,
        function(err, result) {
            if( parseInt( result.toString() ) > 0 ) {
                $('#sell_label').html( " (" + result.toString() + " of your units are still waiting for a buyer)" );
                $('#cancel_label').html( " (" + result.toString() + " units)" );
                $('#cancel_button').prop('disabled', false);                                
                
            }
            else {
                $('#sell_label').html( " " );
                $('#cancel_label').html( " " );                
                $('#cancel_button').prop('disabled', true);
            }
        });
};


var updateNumBuysOfUser = function( ) {
    var sender = getPublicAccount();
    globalContractInstance.buyerNumDeals(sender,
        function(err, result) {
            if( parseInt( result.toString() ) > 0 ) {
                $('#buy_label').html( " (you bought " + result.toString() + " Chametz units)" );
                $('#return_label').html( " (" + result.toString() + " units)" );
            }
            else {
                $('#buy_label').html( " " );
                $('#return_label').html( " " );                
            }
        });
};

var numOpenDeals = function() {
    globalContractInstance.numChametzForSale(
        function(err, result) {
            $('#units_for_sale_label').html( result.toString() + " Chametz units are currently available for sale" );
            if( parseInt( result.toString() ) == 0 ) {            
                $('#buy_button').prop('disabled', true);
            }        
            else{
                $('#buy_button').prop('disabled', false);                
            }
            //alert(result);
        });          
};

var getFormattedTime = function( unix_timestamp ) {
    var date = new Date(unix_timestamp*1000);
    // Hours part from the timestamp
    var days = parseInt(unix_timestamp / (24 * 3600));
    var hours = parseInt(unix_timestamp / (3600)) % 60;
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    
    return days.toString() + " days and " + formattedTime + " hours";
};

var timesTillPassover = function() {
    globalContractInstance.passoverStartTime(
        function(err, result) {
            var passoverStart = parseInt(result);
            var currentTime = getEpoc();
            $('#return_button').prop('disabled', true);
            if( passoverStart > currentTime ) {                
                $('#time_label').html( getFormattedTime(passoverStart-currentTime) + " until Passover begins");
                $('#cancel_button').prop('disabled', true);                                
            } 
            else {
                $('#sell_button').prop('disabled', true);
                $('#buy_button').prop('disabled', true);                                
            
                globalContractInstance.passoverEndTime(
                    function(err, result) {
                        var passoverEnd = parseInt(result);
                        var currentTime = getEpoc();
                        if( passoverEnd > currentTime ) {                
                            $('#time_label').html( getFormattedTime(passoverEnd-currentTime) + " until Passover ends");                
                        }
                        else {
                            $('#time_label').html( "Passover ended");
                            $('#return_button').prop('disabled', false);                            
                        } 
                    });
                
            }        
        });              
};




var updateDisplay = function() {
    updateUnsoldSellsOfUser();
    updateNumBuysOfUser();
    numOpenDeals();
    timesTillPassover();
    
    setTimeout( updateDisplay, 1000 );
}


// num unsold deals
// num bought deals
// time to cancel
// time to return
// time left to buy/sell
// num open deals