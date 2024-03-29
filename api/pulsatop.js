exports.isiTransfer = function (paidTransaction, callback) {
    //Kirim ke API

    const axios = require("axios");
    let qs = require("qs");
    let pt = paidTransaction;

    //axios raw code
    axios({
        method: 'POST',
        url: process.env.APIPULSATOP,
        params: {
            key: process.env.KEY,
        },
        data: qs.stringify({ 
            operator: pt[0].operator,
            phone: pt[0].phone,
            secret: process.env.SECRET,
            denom: pt[0].denom 
        })
    })
    .then((response) => {
        console.log(response.data);
        console.log(response.status);
        return callback(response.data.code);
    })
    .catch((err) =>{
        console.log(err);
        return callback(response.data.code);
    });         
}

exports.isiViaSaldo = function (denom, phone, operator, callback) {
    //Kirim ke API

    const axios = require("axios");
    let qs = require("qs");
    
    //axios raw code
    axios({
        method: 'POST',
        url: process.env.APIPULSATOP,
        params: {
            key: process.env.KEY,
        },
        data: qs.stringify({ 
            operator: operator,
            phone: phone,
            secret: process.env.SECRET,
            denom: denom 
        })
    })
    .then((response) => {
        console.log(response.data);
        console.log(response.status);
        return callback(response.data.code);
    })
    .catch((err) =>{
        console.log(err);
        return callback(response.data.code);
    });         
}