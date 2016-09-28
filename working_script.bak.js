// Set some initial variables
// TODO - learn meteor

var contractAddress = '0x5d7ed36a08c5ee76032d0759c51045e275ecadd0';
var contractAddressTestnet = '0x040cd40c0b2d59bbc3b10ee20d453db5034c0496';
var contractABI = [{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeDeposit","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeClaim","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_depositDurationInHours","type":"uint256"},{"name":"_claimDurationInHours","type":"uint256"},{"name":"_claimUnitValueInWei","type":"uint256"},{"name":"_claimDepositInWei","type":"uint256"},{"name":"_minNumClaims","type":"uint256"}],"name":"newDeal","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_startTime","type":"uint256"},{"indexed":false,"name":"_depositDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimUnitValueInWei","type":"uint256"},{"indexed":false,"name":"_claimDepositInWei","type":"uint256"},{"indexed":false,"name":"_minNumClaims","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"NewDeal","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_claimer","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Claim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_depositor","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_withdrawer","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_public","type":"bool"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"EnoughClaims","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"DealFullyFunded","type":"event"}];
var globalWeb3;
var globalContractInstance;
var eventScope = {fromBlock: 0, toBlock: 'latest'};
var claimSizeInWei  = new BigNumber(1000 * 1000 * 1000);
var depositSizeInWei = new BigNumber(1000 * 1000 * 1000);
var maxGas = 500000;

var dealDefaultParams = {
    _depositDurationInHours: new BigNumber(1),
    _claimDurationInHours: new BigNumber(1),
    _claimUnitValueInWei: claimSizeInWei,
    _claimDepositInWei: depositSizeInWei,
    _minNumClaims:  new BigNumber(1)    
};

var dealParamsArray = [dealDefaultParams._depositDurationInHours,
                       dealDefaultParams._claimDurationInHours,
                       dealDefaultParams._claimUnitValueInWei,
                       dealDefaultParams._claimDepositInWei,
                       dealDefaultParams._minNumClaims ];
 


function getEpoc(){
    return Math.floor((new Date).getTime()/1000);
}

/////////////////////////////////////////////////////////////////////////////////////////////////

function Deal(newDealEventArgs){
    this._dealId = parseInt( newDealEventArgs._dealId.toString());
    this._startTime = parseInt(newDealEventArgs._startTime.toString());
    this._depositDurationInSecs = parseInt(newDealEventArgs._depositDurationInHours.toString()) * 60 * 60;
    this._claimDurationInSecs = parseInt(newDealEventArgs._claimDurationInHours.toString()) * 60 * 60;
    this._claimUnitValueInWei = newDealEventArgs._claimUnitValueInWei;
    this._minNumClaims = newDealEventArgs._minNumClaims;
    
    this.claim = false;
    this.deposit = false;
    this.withdraw = false;
    
    this.enoughClaims = false;
    this.fullyFunded = false;
        
    
    this.isDefaultParams = function(){
        if( this._depositDurationInHours !== dealDefaultParams._depositDurationInHours ) return false;
        if( this._claimDurationInHours !== dealDefaultParams._claimDurationInHours ) return false;
        if( this._claimUnitValueInWei !== dealDefaultParams._claimUnitValueInWei ) return false;        
        if( this._claimDepositInWei !== dealDefaultParams._claimDepositInWei ) return false;                        
        if( this._minNumClaims !== dealDefaultParams._minNumClaims ) return false;
        
        return true;
    };
    
    this.isInClaimPhase = function(){
        return (this._startTime + this._claimDurationInSecs) > getEpoc();
    };
    
    this.isInDepositPhase = function(){
        if( this.isInClaimPhase() ) return false;
        return (this._startTime + (this._claimDurationInSecs + this._depositDurationInSecs)) > getEpoc();
    };
    
    this.isInWithdrawPhase = function(){
        return this._startTime + (this._claimDurationInSecs + this._depositDurationInSecs) < getEpoc();
    };
    
    this.timeUntilEndOfPhase = function(){
        var epoc = getEpoc();
        var endTime = 0;
        if( this.isInClaimPhase() ){
            endTime = this._startTime + this._claimDurationInSecs - epoc;            
        }
        else if( this.isInDepositPhase()){        
            endTime = this._startTime + this._claimDurationInSecs + this._depositDurationInSecs - epoc;
        }
        
        return endTime;
    };
    
    this.isRelevantToUser = function(){
        if( this.isInClaimPhase() ) return true;
        return (this.claim || this.deposit) && (! this.withdraw);
    };
    
    this.isPublicWithdraw = function(){
        return ( ! this.fullyFunded ) && this.enoughClaims;
    };
    
    this.asPrettyString = function(){
        var zeroFill = function( number, width )
        {
          width -= number.toString().length;
          if ( width > 0 )
          {
            return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
          }
          return number + ""; // always return a string
        };
        var timeToString = function(time){
            var timeToEnd = time;
            var hours = Math.floor(timeToEnd / (60 * 60));
            timeToEnd -= hours * 60 * 60;
            var mins = Math.floor(timeToEnd  /  60);
            timeToEnd -= mins * 60;
            var secs = timeToEnd;            
            return zeroFill(hours,2) + ":" + zeroFill(mins,2) + ":" + zeroFill(secs,2);                        
        }; 
        var id = "#" + zeroFill( this._dealId, 6 );
        
        
        var phase = "";
        if( this.isInClaimPhase() ){
            if( ! this.claim ){
                return id + " in claim phase (will end in " + timeToString(this.timeUntilEndOfPhase()) + " hours)";
            }
            else{
            
                return id + " deposit phase will start in " + timeToString(this.timeUntilEndOfPhase()) + " hours)";
            }
        }
        else if(this.isInDepositPhase()){
            if( ! this.deposit ){
                return id + " in deposit phase (you have to make a deposit in the next " + timeToString(this.timeUntilEndOfPhase()) + " hours)";                
            }
            else{
                return id + " withdraw phase will start in " + timeToString(this.timeUntilEndOfPhase()) + " hours)";                
            }
        }
        else{
            if( ! this.withdraw ){
                var string = id + " in withdraw phase ";
                if( this.deposit ){
                    var toPublic = this.isPublicWithdraw();
                    var onlyDeposit = (! this.enoughClaims);
                    
                    var msg = "";
                    if( toPublic ) msg = "(deal failed (someone cheated), withdraw your ether to your public account)";
                    else if(this.enoughClaims) msg = "(deal was successful, withdraw you ether to your secret account)";
                    else msg = "(deal failed (not enough claimers), withdraw your claim deposit to your secret account)";
                                    
                    string += msg;
                }
                else string += "(you didn't deposit. you are a cheater!!!)";
                return string;
            }
            else{                
                return id + " in withdraw (you already withdrawed your ether)";                
            }            
        }
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

function Deals(){
    var deals = [];
    function isDealInArray(dealId){
        var dealAsInt = parseInt(dealId.toString());    
        for( var i = 0 ; i < deals.length; i++ ){
            if( deals[i]._dealId === dealAsInt ) return i;
        }
        
        return -1;
    }
    function addDeal(newDealArgs){
        var deal = new Deal(newDealArgs);
        deals.push(deal);
        return deal;
    }
    function removeDeal(dealIndex){
        deals.splice(dealIndex,1);
    }
        
    function addDealToSelect(deal){
        var selectWidget = $('#relevant_deals');
        var string = deal.asPrettyString();
        if ( $("#relevant_deals option[value=" + deal._dealId.toString() + "]").length > 0 ){
            $("#relevant_deals").children().filter(function(index, option) {
                return option.value.toString()===deal._dealId.toString();
            }).remove();        
        }
        selectWidget.append($('<option>', {value: deal._dealId.toString(), text:string})); 
    }
    
    function removeDealFromSelect(deal){
        var selectWidget = $('#relevant_deals');
        selectWidget.find("[value=" + deal._dealId.toString() + "]").remove();
    }
            
    this.getDeal = function(dealId){    
        var index = isDealInArray(dealId);
        if( index < 0 ) return null;
        return deals[dealId];
    };    
    this.processDeal = function(eventType, eventArgs ){
        // check if deal is in array
        if( eventType !== "enoughClaims" && eventType !== "fullyFunded"){
            if( ! eventArgs._success ) return null;            
        }
        if( eventType === "withdraw" ){
            if( eventArgs._public && ( eventArgs._withdrawer != getPublicAccount() ) ) return null;
            if( ( ! eventArgs._public ) && ( eventArgs._withdrawer != getPrivateAccount() ) ) return null;
            
        }
        
        var dealIndex = isDealInArray(eventArgs._dealId);
        var deal;
        if( dealIndex < 0 ){
            if( eventType !== "newDeal" ){
                alert("unreachable code");
                return null;
            }        
            deal = addDeal(eventArgs);
        }
        else{            
            deal = deals[dealIndex];    
        }
        
        if( eventType === "newDeal" ){
            if( dealIndex < 0 ){
                if( deal.isRelevantToUser()){
                    addDealToSelect(deal);
                }
            }                
        }
        else if( eventType === "withdraw" ){
            deal.withdraw = true;
            removeDealFromSelect(deal);
        }
        else if( eventType === "deposit" ){
            deal.deposit = true;
            addDealToSelect(deal);
            listenToFullyFundedEvent(deal._dealId);
        }
        else if( eventType === "claim" ){
            deal.claim = true;
            addDealToSelect(deal);
            listenToEnoughClaimsEvent(deal._dealId);               
            
        }
        else if( eventType === "enoughClaims" ){
            deal.enoughClaims = true;
            addDealToSelect(deal);            
        }
        else if( eventType === "fullyFunded" ){
            deal.fullyFunded = true;
            addDealToSelect(deal);            
        }
        
        
        return deal;
    };
}

var globalAllDeals = new Deals();


function handleError(err){
    return;
}

function getAccounts(){
    return globalWeb3.eth.accounts;
}

function getPrivateAccount(){
    return $( "#secret_address option:selected" ).text();
}

function getPublicAccount(){
    return $( "#public_address option:selected" ).text();
}

var waitForEventConifrmFunc = function(event, tx, callback){
    event.watch(function(err, result){        
        if(err) { callback(); return handleError(err); }
        if(result.transactionHash === tx ) callback(result.args);
        event.stopWatching();     
    });
};

var createNewDealFunc = function(){
    var button = $('#new_deal');
    var originalText = button.html();
    var sender = getPublicAccount();
    
    globalContractInstance.newDeal( dealParamsArray[0],
                                    dealParamsArray[1],
                                    dealParamsArray[2],
                                    dealParamsArray[3],
                                    dealParamsArray[4],
                                    {from: sender, value: 0},
                                    function( err, result ){
                                       if( err ) return handleError(err);
                                       button.prop('disabled', true);
                                       button.html( "waiting for confirmation..." );
                                       waitForEventConifrmFunc(globalContractInstance.NewDeal(),
                                                               result,
                                                               function(args){
                                                                          if( args._success ) alert("new deal");
                                                                          else alert( "new deal failed: " + args._err );
                                                                          button.html( originalText );
                                                                          button.prop('disabled', false);});
                                    } );    
};

function listenToDeals(){
    var listenToEvent = function( event, eventType ){
        event.watch(function(err,result){
           if( err ) return handleError(err);
           globalAllDeals.processDeal(eventType, result.args ); 
        });        
    };
    
    listenToEvent( globalContractInstance.NewDeal(), "newDeal" );
    listenToEvent( globalContractInstance.Claim({_claimer: getPrivateAccount()}), "claim" );
    listenToEvent( globalContractInstance.Deposit({_depositor: getPublicAccount()}), "deposit" );    
    listenToEvent( globalContractInstance.Withdraw({_withdrawer: getPrivateAccount()}), "withdraw" );    
    listenToEvent( globalContractInstance.Withdraw({_withdrawer: getPublicAccount()}), "withdraw" );
}

function getDeals(){
    var getAllEvents = function( newEvent, eventType, finalCallback ){
        newEvent.get(function(err,logs){
            if( err ) return handleError(err);
            for( var logInd = 0 ; logInd < logs.length ; logInd++){
                globalAllDeals.processDeal(eventType, logs[logInd].args );            
            }
            newEvent.stopWatching();
            finalCallback();
        });
    };
    
    var getPrivateWithdrawFunc = function(){
        getAllEvents( globalContractInstance.Withdraw({_withdrawer: getPrivateAccount()},{fromBlock: 0, toBlock: 'latest'}), "withdraw", function(){
            $("#relevant_deals_label").html("revelvant deals are loaded");
            listenToDeals();
        });        
    };
    var getPublicWithdrawFunc = function(){
        getAllEvents(globalContractInstance.Withdraw({_withdrawer: getPublicAccount()},{fromBlock: 0, toBlock: 'latest'}), "withdraw",getPrivateWithdrawFunc);
    };
    var getDepositFunc = function(){    
        getAllEvents( globalContractInstance.Deposit({_depositor: getPublicAccount()},{fromBlock: 0, toBlock: 'latest'}), "deposit", getPublicWithdrawFunc);
    };
    var getClaimFunction = function(){
        getAllEvents( globalContractInstance.Claim({_claimer: getPrivateAccount()},{fromBlock: 0, toBlock: 'latest'}), "claim", getDepositFunc);
    };
    var getNewDealsFunction = function(){
        getAllEvents( globalContractInstance.NewDeal({},{fromBlock: 0, toBlock: 'latest'}), "newDeal", getClaimFunction);
    };
    getNewDealsFunction();    
}

///////////////////////////////////////////////////////////////////////////////

function listenToEnoughClaimsEvent(dealId){
    var event = globalContractInstance.EnoughClaims({_dealId: dealId},{fromBlock: 0, toBlock: 'latest'});
    event.get(function(err,logs){
       if( err ) return handleError(err);
       var logSize = logs.length;
       for( var logInd = 0 ; logInd < logs.length ; logInd++){
          globalAllDeals.processDeal("enoughClaims", logs[logInd].args );            
       }
       event.stopWatching();
       if( logSize > 0 ) return;
       var listenEvent = globalContractInstance.EnoughClaims({_dealId: dealId},{fromBlock: 0, toBlock: 'latest'});
       listenEvent.watch(function(err,result){
           globalAllDeals.processDeal("enoughClaims", result.args );
           listenEvent.stopWatching(); // this is one time event
       });
        
    });
}

///////////////////////////////////////////////////////////////////////////////

function listenToFullyFundedEvent(dealId){
    var event = globalContractInstance.DealFullyFunded({_dealId: dealId},{fromBlock: 0, toBlock: 'latest'});
    event.get(function(err,logs){
       if( err ) return handleError(err);
       var logSize = logs.length;       
       for( var logInd = 0 ; logInd < logs.length ; logInd++){
          globalAllDeals.processDeal("fullyFunded", logs[logInd].args );            
       }
       event.stopWatching();
       if( logSize > 0 ) return;
       var listenEvent = globalContractInstance.DealFullyFunded({_dealId: dealId},{fromBlock: 0, toBlock: 'latest'});
       listenEvent.watch(function(err,result){
           globalAllDeals.processDeal("fullyFunded", result.args );
           listenEvent.stopWatching(); // this is one time event
       });
        
    });
}

///////////////////////////////////////////////////////////////////////////////

function getActiveDealId(){
    return $("#relevant_deals option:selected").val();
}


var makeClaimFunc = function(){
    var button = $('#make_claim');
    var originalText = button.html();
    var sender = getPrivateAccount();
    var dealId = new BigNumber(getActiveDealId());
    var deal   = 

    globalContractInstance.makeClaim( dealId,
                                      {from: sender, value: dealDefaultParams._claimDepositInWei, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        button.prop('disabled', true);
                                        button.html( "waiting for confirmation..." );
                                        waitForEventConifrmFunc(globalContractInstance.Claim({_dealId: dealId, _claimer: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alert("new claim");
                                                                           else alert("claim failed: " + args._err );
                                                                           button.html(originalText);
                                                                           button.prop('disabled', false);}
                                                                );
                                        });
};


var makeDepositFunc = function(){
    var button = $('#make_deposit');
    var originalText = button.html();
    var sender = getPublicAccount();
    var dealId = new BigNumber(getActiveDealId());

    globalContractInstance.makeDeposit( dealId,
                                      {from: sender, value: dealDefaultParams._claimUnitValueInWei, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        button.prop('disabled', true);
                                        button.html( "waiting for confirmation..." );
                                        waitForEventConifrmFunc(globalContractInstance.Deposit({_dealId: dealId, _depositor: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alert("new deposit");
                                                                           else alert( "deposit failed: " + args._err );
                                                                           button.html(originalText);
                                                                           button.prop('disabled', false);}
                                                                );
                                        });
};

var makeWithdrawFunc = function(){
    var button = $('#make_withdraw');
    var originalText = button.html();
    var publicSender = getPublicAccount();
    var privateSender = getPrivateAccount();
    var dealAsInt = parseInt( getActiveDealId().toString() );
    
    var dealId = new BigNumber(dealAsInt);
    var deal = globalAllDeals.getDeal(dealAsInt);
    var sender;
    if( deal.isPublicWithdraw()) sender = publicSender;
    else sender = privateSender;
alert(1);

    globalContractInstance.withdraw( dealId,
                                      {from: sender, value: 0, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        button.prop('disabled', true);
                                        button.html( "waiting for confirmation..." );
                                        waitForEventConifrmFunc(globalContractInstance.Withdraw({_dealId: dealId, _withdrawer: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alert("new withdraw");
                                                                           else alert( "withdraw failed: " + args._err );
                                                                           button.html(originalText);
                                                                           button.prop('disabled', false);}
                                                                );
                                        });    
};


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
    
    var accounts = web3.eth.accounts;

    
    for( var i = 0 ; i < accounts.length ; i++ ){
    	$('#secret_address').append($('<option>', {value: i, text: accounts[i].toString()}));
        $('#public_address').append($('<option>', {value: i, text: accounts[i].toString()}));    	
    }
    
    getDeals();   
    
    $('#new_deal').click(createNewDealFunc);
    $('#make_claim').click(makeClaimFunc);
    $('#make_deposit').click(makeDepositFunc);    
    $('#make_withdraw').click(makeWithdrawFunc);

    
	/*
	web3.eth.getAccounts(function(error, result){
		//alert(error.toString());
		if( ! error ){
			alert( result.length );
			alert( result[0] ); alert( result[1] );
			for( var i = 0 ; i < result.length ; i++ ){				
			    $('#secret_address').append($('<option>', {value:result[i].toString(), text:result[i].toString()));			
			}
		}
	});*/
});