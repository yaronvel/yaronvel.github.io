function DealFullDisplay(dealEventArgs){
    var toInt = function(bigNumber){
        return parseInt(bigNumber.toString());  
    };
    this._dealId = toInt(dealEventArgs._dealId);
    this._startTime = toInt(dealEventArgs._startTime);
    this._depositDurationInHours = toInt(dealEventArgs._depositDurationInHours);
    this._claimDurationInHours = toInt(dealEventArgs._claimDurationInHours);        
    this._claimUnitValueInEther = dealEventArgs._claimUnitValueInWei.dividedBy(etherToWei);
    this._claimDepositInEther = dealEventArgs._claimDepositInWei.dividedBy(etherToWei);
    this._minNumClaims = dealEventArgs._minNumClaims;
    this.dealStatus = null;
    
    this.addStatus = function( _dealStatus ){
        this.dealStatus = _dealStatus;  
    };

    this.getLineId = function(){
        return "AllDeals_lineid_" + this._dealId.toString();  
    };

    this.getDealLine = function(){
        var getIconCol = function(iconName, text){
          return "<td><i class=\"fa fa-" + iconName + "\" aria-hidden=\"true\"></i>&nbsp;" + text.toString() + "</td>";
        };
        var get2IconCol = function(iconName1, iconName2, text){
          return "<td><i class=\"fa fa-" + iconName1 + "\" aria-hidden=\"true\"></i><i class=\"fa fa-" + iconName2 + "\" aria-hidden=\"true\"></i>&nbsp;" + text.toString() + "</td>";
        };        
        
        var startTimeDate = new Date(this._startTime * 1000 );
        var line = "<tr class=\"dapp-input\" id=\"" + this.getLineId() + "\">" +
                              getIconCol("hashtag",this._dealId) +
                              getIconCol("calendar",startTimeDate) +
                              get2IconCol("clock-o","shopping-cart",this._claimDurationInHours) +
                              get2IconCol("clock-o","bank", this._depositDurationInHours) +
                              getIconCol("money", this._claimUnitValueInEther) +
                              getIconCol("legal", this._claimDepositInEther) +
                              getIconCol("user-times", this._minNumClaims);
        if( this.dealStatus !== null ){
            line += getIconCol("users", this.dealStatus.getNumClaims()) +
                    getIconCol("percent", this.dealStatus.getDepositSumPercent());
        }
        
        return line + "</tr>";
    };
        
    
    this.makeUI = function(){
        if( $("#" + this.getLineId()).length > 0 ){
            $("#" + this.getLineId()).html(this.getDealLine());            
        }
        else{
            $("#all_deals_table").append(this.getDealLine());                        
        }
        
        if( this.dealStatus === null ){
            var hanldeDealStatus = function(err, result){
                if( err ) return handleError(err);
                this.dealStatus = new DealStatus(result[0],
                                                 result[1],
                                                 result[2],
                                                 result[3]);
                this.makeUI();                
            };
            globalContractInstance.dealStatus( new BigNumber(this._dealId), hanldeDealStatus.bind(this));
        }
    };
}

var makeAllDealsTable = function(){
    var event = globalContractInstance.NewDeal({},{fromBlock: 0, toBlock: 'latest'});
    event.get(function(err,logs){
        if( err ) return handleError(err);
        for( var i = 0 ; i < logs.length ; i++ ){
            args = logs[i].args;
            deal = new DealFullDisplay(args);
            deal.makeUI();            
        }
        
        // finished loading
        $("#all_deals_table").show();
        $("#all_deals_before_load").hide(); 
    });
};

