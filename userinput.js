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
