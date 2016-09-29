function DealStatus(active, numClaims, claimSum, depositSum){
    this.active = active;
    this.numClaims = numClaims;
    this.claimSum = claimSum;
    this.depositSum = depositSum;
    
    this.isFullyFunded = function(){
        return this.depositSum.lessThanOrEqualTo(this.claimSum);
    };
    
    this.getNumClaims = function(){
        return parseInt(this.numClaims.toString());
    };
    
    this.getDepositSumPercent = function(){
        var depositSum100 = this.depositSum.dividedBy( new BigNumber("0.01") );
        var percent = depositSum100.dividedBy(this.claimSum);
        percent = percent.round();
        return parseInt(percent);  
    };
    
    this.isActive = function(){
        return this.active.equals(new BigNumber("1"));
    };
}

function NewDealUI(){
    this.waitingForconfirm = false;
    this.makeUI = function(){
        var dealPhaseTime = parseInt(dealDefaultParams._claimDurationInHours.toString()) * 60 * 60;
        
        if( ( globalAllDeals.lastOpenDealTime + dealPhaseTime ) > getEpoc() ){
            $("#first_new_deal").hide();
        }
        else{
            $("#first_new_deal").show();
        }
        
        $("#first_new_deal").off().click(createNewDealFunc);
        
        var action;
        var icon = "icon-arrow-right";
        
        if( this.waitingForconfirm ){
            action = "Waiting for confirmation...";
            icon = "icon-hourglass";            
        }
        else{
            action = "Create New Mixing Deal";
            icon = "icon-star";
        }
        
        var string = "<span class=\"item-box-deal\"><span class=\"item-new-deal\"><span aria-hidden=\"true\" class=\""
                   + icon + 
                   "\"></span>&nbsp;" + action +"</span></span>";
        //var shortString = "</span class=>&nbsp;" + action +"</span>";
        string = "<button class=\"item-box-new-deal\" id=\"first_new_deal_button\">" + string + "</button>";
        
        $("#first_new_deal").html(string);
        $("#first_new_deal_button").attr("disabled", this.waitingForconfirm);
        if( this.waitingForconfirm ) $("#first_new_deal_button").off();                        

        
        setTimeout( this.makeUI.bind(this), 1000 * 10 );
    };
    
    this.clickStart = function(){
        this.waitingForconfirm = true;
        this.makeUI();
    };
    
    this.clickEnd = function(){
        this.waitingForconfirm = false;
        this.makeUI();        
    };    
}

function DealUI(deal){
    this.deal = deal;
    this.waitingForconfirm = false;
    
    var zeroFill = function ( number, width ){
        width -= number.toString().length;
        if ( width > 0 )
        {
            return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
        }
        return number + ""; // always return a string
    };    
    
    
    this.listItemId = function(){
      return "DealUI_listitem_id_" + this.deal._dealId.toString();  
    };

    this.dealId = function(){
      return "DealUI_deal_id_" + this.deal._dealId.toString();  
    };    
    
    this.actionId = function(){
      return "DealUI_action_id_" + this.deal._dealId.toString();  
    };
      
    this.timeId = function(){
      return "DealUI_time_id_" + this.deal._dealId.toString();  
    };      
      
    this.makeDealIdObject = function(){
        var string = "<span id=\"" + this.dealId() +"\" class=\"item-box-actions\"><span class=\"item-actions\"><span aria-hidden=\"true\" class=\""
                   + "icon-note" + 
                   "\"></span>&nbsp;" + "#" + zeroFill(this.deal._dealId,8) +"</span></span>";
        
        return string;                        
    };   
      
    this.makeTodoObject = function(){
        var action;
        var icon = "icon-arrow-right";
        
        if( this.waitingForconfirm ){
            action = "Waiting for confirmation...";
            icon = "icon-hourglass";            
        }
        else if( this.deal.isInClaimPhase()){
            action = "Join";
            if( deal.claim ){
                action = "Wait for deposit phase";
                icon = "icon-hourglass";
            }
        }
        else if( this.deal.isInDepositPhase()){
            action = "Deposit";
            if( deal.deposit ){
                action = "Wait for withdraw phase";
                icon = "icon-hourglass";
            }
        }
        else{
            action = "Withdraw";

            if( ( ! this.deal.deposit ) && this.deal.enoughClaims ){
                action = "You forgot to deposit.";
                icon = "icon-dislike";
            }
            else if( this.deal.withdraw ){
                action = "Completed";
                icon = "icon-check";
            }
        }
        
        var string = "<span class=\"item-box-actions\"><span class=\"item-actions\"><span aria-hidden=\"true\" class=\""
                   + icon + 
                   "\"></span>&nbsp;" + action +"</span></span>";
        string = "<button id=\"" + this.actionId() + "\">" + string + "</button>";
        
        return string;                        
    };
    
    this.assignTodoFunction = function(){
      var clbk;
      var enable = true;
      if( deal.isInClaimPhase() ){
          clbk = makeClaimFunc;
          if( deal.claim || this.waitingForconfirm ) enable = false;
      }
      else if( deal.isInDepositPhase() ){
          clbk = makeDepositFunc;
          if( deal.deposit || this.waitingForconfirm ) enable = false;
      }
      else{
          clbk = makeWithdrawFunc;
          if( deal.withdraw || this.waitingForconfirm || (!deal.deposit && deal.enoughClaims) ) enable = false;
      }
      
      $("#" + this.actionId() ).off().click(clbk);
      $("#" + this.actionId() ).attr("disabled", ! enable);
        
    };
    
    this.makeTimeObject = function(){
        var timeToString = function(time){
            var timeToEnd = time;
            var hours = Math.floor(timeToEnd / (60 * 60));
            timeToEnd -= hours * 60 * 60;
            var mins = Math.floor(timeToEnd  /  60);
            timeToEnd -= mins * 60;
            var secs = timeToEnd;            
            return zeroFill(hours,2) + ":" + zeroFill(mins,2) + ":" + zeroFill(secs,2);                        
        };
            
        var timeString = "";
        if( ! this.deal.isInWithdrawPhase() ){
            timeString = timeToString( this.deal.timeUntilEndOfPhase() );
        }
                
        var string = "<span class=\"item-box-actions\"><span id=\"" + this.timeId() + "\" class=\"item-actions\"><span aria-hidden=\"true\" class=\""
                   + "icon-speedometer" + 
                   "\"></span>&nbsp;" + timeString +"</span></span>";
        
        return string;                                
    };
    
    this.makeInfoObject = function(){            
        if( ! this.deal.isInWithdrawPhase() ){
            if( this.deal.status === null ) return "";
        }
        else if( ! this.deal.deposit ) return "";
        
        if( this.waitingForconfirm ) return "";
                
        var text;
        if( this.deal.isInClaimPhase() ){
            if( this.deal.status.getNumClaims() === 1 ){
                text = this.deal.status.getNumClaims().toString() + " user already joined";                
            }
            else{
                text = this.deal.status.getNumClaims().toString() + " users already joined";
            }
        }
        else if( this.deal.isInDepositPhase() ){
            text = this.deal.status.getDepositSumPercent().toString() + "% of users already deposited";
        }
        else{
            if( ! this.deal.enoughClaims ){
                text = "Not enough users. Withdraw collateral to secret account";
            }
            else if( ! this.deal.fullyFunded ){
                text = "Cheat detected. Withdraw collateral and deposit to public account";
            }
            else{
                text = "Successful mix";
            }
        }
                
        var string = "<span class=\"item-box-actions\"><span id=\"" + this.timeId() + "\" class=\"item-actions\"><span aria-hidden=\"true\" class=\""
                   + "icon-info" + 
                   "\"></span>&nbsp;" + text +"</span></span>";
        
        return string;                                
    };   
          
    this.makeObjectsString = function(){
        var idObject = this.makeDealIdObject();
        var todoObject = this.makeTodoObject();
        var timeObject = this.makeTimeObject();
        var infoObject = this.makeInfoObject();
        if( this.deal.isInWithdrawPhase() ) timeObject = "";
        
        var lineObject = "<li id=" + this.listItemId() + ">" + idObject + timeObject + infoObject + todoObject + "</li>";

        return lineObject;        
    };
       
    this.makeUI = function(){
        if( this.deal.isInWithdrawPhase() && this.deal.withdraw ) return;
            
        var lineObject = this.makeObjectsString();
        if( $("#" + this.listItemId() ).length > 0 ){
            $("#" + this.listItemId() ).html(lineObject);
        }
        else{        
            $("#deal_list").append(lineObject);
        }
        
        this.assignTodoFunction();

        if( this.deal.isInWithdrawPhase() && ( !this.deal.claim ) ){
            $("#" + this.listItemId() ).hide();
            return;
        }
        
        if( this.deal.isInWithdrawPhase() && ( this.deal.withdraw || ((!this.deal.deposit && this.deal.enoughClaims) && globalAllDeals.doneLoading) ) ){
            var time = 180000;
            if( this.deal._startTime + 3*(this.deal._depositDurationInSecs + this.deal._depositDurationInSecs) < getEpoc() ){
                time = 1;                
            }
            $("#" + this.listItemId() ).fadeOut(time);
            return;
        }
        
        setTimeout( this.makeUI.bind(this), 500 );
    };
    
    this.removeUI = function(){
        if( $("#" + this.listItemId() ).length > 0 ){
            $("#" + this.listItemId() ).remove();
        }                
    };
    
    this.clickStart = function(){
        this.waitingForconfirm = true;
        this.makeUI();
    };
    
    this.clickEnd = function(){
        this.waitingForconfirm = false;
        this.deal.updateStatusWithoutPolling();
        this.makeUI();        
    };    
}

/////////////////////////////////////////////////////////////////////////////////////////////////

function Deal(newDealEventArgs){
    if( newDealEventArgs._dealId === undefined ){
        this._dealId = -1; // this is needed to create default deal
        this._startTime = 0;        
    }
    else{
        this._dealId = parseInt( newDealEventArgs._dealId.toString());
        this._startTime = parseInt(newDealEventArgs._startTime.toString());        
    }
    this._depositDurationInSecs = parseInt(newDealEventArgs._depositDurationInHours.toString()) * 60 * 60;
    this._claimDurationInSecs = parseInt(newDealEventArgs._claimDurationInHours.toString()) * 60 * 60;
    this._claimUnitValueInWei = newDealEventArgs._claimUnitValueInWei;
    this._claimDepositInWei = newDealEventArgs._claimDepositInWei;
    this._minNumClaims = parseInt(newDealEventArgs._minNumClaims.toString());
    
    this.claim = false;
    this.deposit = false;
    this.withdraw = false;
    
    this.enoughClaims = false;
    this.fullyFunded = false;
            
    this.status = null;
    
    this.updateStatusWithoutPolling = function(){
        getDealStatus(this);
    };
    this.updateStatus = function(){
        getDealStatus(this);
        if( ! this.isInWithdrawPhase()){
            setTimeout( this.updateStatus.bind(this), 600000 ); // update every 10 mins
        }  
    };
    
    this.isDefaultParams = function(){
        var defaultDeal = new Deal(dealDefaultParams);
        if( this._depositDurationInSecs !== defaultDeal._depositDurationInSecs ){
             return false;
        }
        if( this._claimDurationInSecs !== defaultDeal._claimDurationInSecs ){
            return false;
        }
        if( ! this._claimUnitValueInWei.equals(defaultDeal._claimUnitValueInWei) ){
            return false;
        }        
        if( ! this._claimDepositInWei.equals( defaultDeal._claimDepositInWei ) ){
            return false;
        }                        
        if( this._minNumClaims !== defaultDeal._minNumClaims ){
            return false;
        }
        
        return true;
    };
    
    this.isInClaimPhase = function(){
        return (this._startTime + this._claimDurationInSecs) > getEpoc();
    };
    
    this.isInDepositPhase = function(){
        if( this.isInClaimPhase() ) return false;
        if( ! this.enoughClaims ) return false;
        return (this._startTime + (this._claimDurationInSecs + this._depositDurationInSecs)) > getEpoc();
    };
    
    this.isInWithdrawPhase = function(){
        if( ( ! this.isInClaimPhase() ) && ( ! this.enoughClaims ) ) return true;
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
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

function Deals(){
    var dealUIs = [];
    this.lastOpenDealTime = 0;
    this.doneLoading = false;
    function isDealInArray(dealId){
        var dealAsInt = parseInt(dealId.toString());    
        for( var i = 0 ; i < dealUIs.length; i++ ){
            if( dealUIs[i].deal._dealId === dealAsInt ) return i;
        }
        
        return -1;
    }
    this.addDeal = function(newDealArgs){
        var deal = new Deal(newDealArgs);
        if( ! deal.isDefaultParams() ) return null;
        deal.updateStatus();
        var dealUI = new DealUI(deal);
        dealUIs.push(dealUI);
        if( deal._startTime > this.lastOpenDealTime ){
            this.lastOpenDealTime = deal._startTime;
        }
        return dealUI;
    }
    function removeDeal(dealIndex){
        dealUIs.splice(dealIndex,1);
    }
        
    function addDealToSelect(dealUI){
        dealUI.makeUI();
        /*
        var selectWidget = $('#relevant_deals');
        var string = deal.asPrettyString();
        if ( $("#relevant_deals option[value=" + deal._dealId.toString() + "]").length > 0 ){
            $("#relevant_deals").children().filter(function(index, option) {
                return option.value.toString()===deal._dealId.toString();
            }).remove();        
        }
        selectWidget.append($('<option>', {value: deal._dealId.toString(), text:string}));*/ 
    }
    
    function removeDealFromSelect(dealUI){
        dealUI.removeUI(); // TODO
        /*
        var selectWidget = $('#relevant_deals');
        selectWidget.find("[value=" + deal._dealId.toString() + "]").remove();*/
    }
            
    this.getDeal = function(dealId){    
        var index = isDealInArray(dealId);
        if( index < 0 ) return null;
        return dealUIs[dealId].deal;
    };
    
    this.getDealUI = function(htmlActionId){
      for( var i = 0 ; i < dealUIs.length ; i++ ){
          if( htmlActionId === dealUIs[i].actionId() ) return dealUIs[i];
      }
      
      return null;
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
        var dealUI;
        var deal;
        if( dealIndex < 0 ){
            if( eventType !== "newDeal" ){
                return null;
            }
            dealUI = this.addDeal(eventArgs);
            if( dealUI === null ) return null; // not a default deal
        }
        else{            
            dealUI = dealUIs[dealIndex];    
        }
        
        deal = dealUI.deal;
        if( eventType === "newDeal" ){
            if( dealIndex < 0 ){
                if( deal.isRelevantToUser()){
                    addDealToSelect(dealUI);
                }
            }                
        }
        else if( eventType === "withdraw" ){
            deal.withdraw = true;
            removeDealFromSelect(dealUI);
        }
        else if( eventType === "deposit" ){
            deal.deposit = true;
            addDealToSelect(dealUI);
            listenToFullyFundedEvent(deal._dealId);
        }
        else if( eventType === "claim" ){
            deal.claim = true;
            addDealToSelect(dealUI);
            listenToEnoughClaimsEvent(deal._dealId);               
            
        }
        else if( eventType === "enoughClaims" ){
            deal.enoughClaims = true;
            addDealToSelect(dealUI);            
        }
        else if( eventType === "fullyFunded" ){
            deal.fullyFunded = true;
            addDealToSelect(dealUI);            
        }
        
        
        return deal;
    };
}

