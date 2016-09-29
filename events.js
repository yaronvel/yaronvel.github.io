var alertStatus = function(msg){
  $("#footer_status_msg").html(msg);
  $("#footer_status_msg").show();  
  $("#footer_status_msg").fadeOut(60000); // 1 minute    
};

var waitForEventConifrmFunc = function(event, tx, callback){
    event.watch(function(err, result){        
        if(err) { callback(); return handleError(err); }
        if(result.transactionHash === tx ) callback(result.args);
        event.stopWatching();     
    });
};

var createNewDealFunc = function(){
    var sender = getPublicAccount();
    
    globalContractInstance.newDeal( dealParamsArray[0],
                                    dealParamsArray[1],
                                    dealParamsArray[2],
                                    dealParamsArray[3],
                                    dealParamsArray[4],
                                    {from: sender},
                                    function( err, result ){
                                       if( err ) return handleError(err);
                                       newDealUIInstance.clickStart();
                                       waitForEventConifrmFunc(globalContractInstance.NewDeal(),
                                                               result,
                                                               function(args){
                                                                          if( args._success ) alertStatus("New deal created");
                                                                          else alertStatus( "New deal failed: " + args._err );
                                                                          newDealUIInstance.clickEnd();
                                                                          });
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
    globalAllDeals = new Deals();
    $("#before_load").show();
    $("#after_load").hide();

    
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
            $("#before_load").hide();
            $("#after_load").show();
            //       $("#relevant_deals_label").html("revelvant deals are loaded");
            listenToDeals();
            newDealUIInstance = new NewDealUI();
            newDealUIInstance.makeUI();
            globalAllDeals.doneLoading = true;            
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

function getActiveDealUI(event){
    
    return globalAllDeals.getDealUI(event.currentTarget.id);
}


var makeClaimFunc = function(event){
    var sender = getPrivateAccount();
    var dealUI = getActiveDealUI(event);
    var dealId = new BigNumber(dealUI.deal._dealId);

    globalContractInstance.makeClaim( dealId,
                                      {from: sender, value: dealDefaultParams._claimDepositInWei, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        dealUI.clickStart();
                                        waitForEventConifrmFunc(globalContractInstance.Claim({_dealId: dealId, _claimer: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alertStatus("Join deal completed");
                                                                           else alertStatus("Join deal failed: " + args._err );
                                                                           dealUI.clickEnd();
                                                                           }
                                                                );
                                        });
};


var makeDepositFunc = function(event){
    var sender = getPublicAccount();
    var dealUI = getActiveDealUI(event);
    var dealId = new BigNumber(dealUI.deal._dealId);

    globalContractInstance.makeDeposit( dealId,
                                      {from: sender, value: dealDefaultParams._claimUnitValueInWei, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        dealUI.clickStart();
                                        waitForEventConifrmFunc(globalContractInstance.Deposit({_dealId: dealId, _depositor: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alertStatus("Make deposit completed");
                                                                           else alertStatus( "Deposit failed: " + args._err );
                                                                           dealUI.clickEnd();
                                                                           }
                                                                );
                                        });
};

var makeWithdrawFunc = function(event){
    var publicSender = getPublicAccount();
    var privateSender = getPrivateAccount();
    
    var dealUI = getActiveDealUI(event);
    var dealId = new BigNumber(dealUI.deal._dealId);    
    var deal = dealUI.deal;
    var sender;
    if( deal.isPublicWithdraw()) sender = publicSender;
    else sender = privateSender;

    globalContractInstance.withdraw( dealId,
                                      {from: sender, value: 0, gas: maxGas},
                                      function( err, result ){
                                        if( err ) return handleError(err);
                                        dealUI.clickStart();                                        
                                        waitForEventConifrmFunc(globalContractInstance.Withdraw({_dealId: dealId, _withdrawer: sender}),
                                                                result,
                                                                function(args){
                                                                           if( args._success ) alertStatus("Withdraw completed");
                                                                           else alertStatus( "Withdraw failed: " + args._err );
                                                                           dealUI.clickEnd();
                                                                           }
                                                                );
                                        });    
};

var selectAccountChange = function(){
    if( ( $('#secret_address').val() < 0 ) || ( $('#public_address').val() < 0) ){
        $("#before_load").hide();
        $("#after_load").hide();    
        return;
    }
    
    $('#secret_address').attr('disabled', true);
    $('#public_address').attr('disabled', true);
    
    getDeals();
};

var getDealStatus = function(deal){
    globalContractInstance.dealStatus( new BigNumber(deal._dealId),
                                       function( err, result ){
                                           if( err ) return handleError(err);
                                           deal.status = new DealStatus(result[0],
                                                                        result[1],
                                                                        result[2],
                                                                        result[3]);
                                        });
};

