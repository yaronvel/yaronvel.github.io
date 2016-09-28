var contractAddress = '0x5d7ed36a08c5ee76032d0759c51045e275ecadd0';
var contractAddressTestnet = '0x262f9ed983c644d7f05c11edea6957d2426f5246';
var contractABI = [{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeDeposit","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"makeClaim","outputs":[{"name":"","type":"uint8"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"dealId","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_dealId","type":"uint256"}],"name":"dealStatus","outputs":[{"name":"","type":"uint256[4]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_depositDurationInHours","type":"uint256"},{"name":"_claimDurationInHours","type":"uint256"},{"name":"_claimUnitValueInWei","type":"uint256"},{"name":"_claimDepositInWei","type":"uint256"},{"name":"_minNumClaims","type":"uint256"}],"name":"newDeal","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_startTime","type":"uint256"},{"indexed":false,"name":"_depositDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimDurationInHours","type":"uint256"},{"indexed":false,"name":"_claimUnitValueInWei","type":"uint256"},{"indexed":false,"name":"_claimDepositInWei","type":"uint256"},{"indexed":false,"name":"_minNumClaims","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"NewDeal","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_claimer","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Claim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_depositor","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_withdrawer","type":"address"},{"indexed":true,"name":"_dealId","type":"uint256"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_public","type":"bool"},{"indexed":false,"name":"_success","type":"bool"},{"indexed":false,"name":"_err","type":"string"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"EnoughClaims","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_dealId","type":"uint256"}],"name":"DealFullyFunded","type":"event"}];
var globalWeb3;
var globalContractInstance;
var eventScope = {fromBlock: 0, toBlock: 'latest'};
var claimSizeInWei  = new BigNumber(1000 * 1000 * 1000);
var depositSizeInWei = new BigNumber(1000 * 1000 * 1000);
var etherToWei = new BigNumber(1000000000000000000);
var depositSizeInEther = depositSizeInWei.dividedBy(etherToWei);
var claimSizeInEther = claimSizeInWei.dividedBy(etherToWei);
var maxGas = 500000;

var dealDefaultParams = {
    _depositDurationInHours: new BigNumber(1),
    _claimDurationInHours: new BigNumber(1),
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