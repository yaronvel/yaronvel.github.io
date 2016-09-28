$(document).ready(function(){


    //$('#secret_address').append($('<option>', {value:-1, text:'select'}));

	    $('#public_address').append($('<option>', {value:-1, text:'select'}));
});


window.addEventListener('load', function() {
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	alert(typeof web3);
	if (typeof web3 !== 'undefined') {

        	// Use Mist/MetaMask's provider
		web3 = new Web3(web3.currentProvider);
		alert("ok");
        } else {
	        alert("Hello! I am an alert box!!");

	        //console.log('No web3? You should consider trying MetaMask!')
	        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
	        //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }
	// Now you can start your app & access web3 freely:
	//alert(web3.accounts.length.toString());
	web3.eth.getAccounts(function(error, result){
		//alert(error.toString());

		if( ! error )
			    $('#secret_address').append($('<option>', {value:result.toString(), text:result.toString()}));			
	});
	/*var accounts = web3.eth.accounts;
	for( var accountInd = 0 ; accountInd < accounts.length ; acountInd++ ){
	    $('#secret_address').append($('<option>', {value:accountInd, text:accounts[accountInd].toString()}));
	}*/

	var simplemixerContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeDeposit","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeClaim","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_depositDurationInHours","type":"uint256"},{"name":"_claimDurationInHours","type":"uint256"},{"name":"_claimUnitValueInWei","type":"uint256"},{"name":"_claimDepositInWei","type":"uint256"},{"name":"_minNumClaims","type":"uint256"}],"name":"newDeal","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_startTime","type":"uint256"},{"indexed":false,"name":"_depositDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimUnitValueInWei","type":"uint256"},{"indexed":false,"name":"_claimDepositInWei","type":"uint256"},{"indexed":false,"name":"_minNumClaims","type":"uint256"}],"name":"NewDeal","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"claimer","type":"address"}],"name":"Claim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"depositor","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"withdrawer","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"EnoughClaims","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"DealFullyFunded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":true,"name":"dealId","type":"uint256"},{"indexed":false,"name":"errorMsg","type":"string"}],"name":"ErrorLog","type":"event"}]);
	var myContractInstance = simplemixerContract.at('0xb8cf94abc403f1faf64abf0bbed7261ee9f0a493');
	$("#make_claim").click(function(){
		myContractInstance.newDeal(new BigNumber(1), new BigNumber(1), new BigNumber(1000), new BigNumber(1000), new BigNumber(1),
			function(error, result){ alert(error.toString())});
	});
});

