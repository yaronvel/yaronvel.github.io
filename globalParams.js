var contractAddress = null;
var contractAddressTestnet = '0x3077791f788e12fcde03d928dd43b62763108013';
var contractAddressMainnet = '0x5cCbba98869018d8F1f87402dC78fEF763c85b89';
var contractAddressClassic = '0xf97f84472ff349245dc09154285b644c54fd743d';

var contractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"deals","outputs":[{"name":"seller","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"nextDealIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"buyerBonus","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"returnChametz","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sell","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"downPayment","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"numChametzForSale","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"cancelSell","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"sellerNumOpenDeals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"buyerNumDeals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"passoverStartTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"buy","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"passoverEndTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"Sell","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"Buy","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"payment","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"ReturnChametz","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"payment","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"CancelSell","type":"event"}];
var globalWeb3;
var globalContractInstance;
var eventScope = {fromBlock: 0, toBlock: 'latest'};
var etherToWei = new BigNumber(1000000000000000000);
var claimSizeInWei  = etherToWei;
var depositSizeInWei = claimSizeInWei.dividedBy(100);
var depositSizeInEther = depositSizeInWei.dividedBy(etherToWei);
var claimSizeInEther = claimSizeInWei.dividedBy(etherToWei);
var maxGas = 500000;

var etc = false;

var dealDefaultParams = {
    _depositDurationInHours: new BigNumber(24),
    _claimDurationInHours: new BigNumber(24),
    _claimUnitValueInWei: claimSizeInWei,
    _claimDepositInWei: depositSizeInWei,
    _minNumClaims:  new BigNumber(2)    
};

var dealParamsArray = [dealDefaultParams._depositDurationInHours,
                       dealDefaultParams._claimDurationInHours,
                       dealDefaultParams._claimUnitValueInWei,
                       dealDefaultParams._claimDepositInWei,
                       dealDefaultParams._minNumClaims ];


function getEpoc(){
    return Math.floor((new Date).getTime()/1000);
}


var globalAllDeals;
var newDealUIInstance;