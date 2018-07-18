const mongoose = require('mongoose');

const Kodeawal = mongoose.model('Kodeawal');

function threeDigit(nomer, callback) {
    if (nomer.substring(0, 3) == "+62") {
        return callback(nomer.substring(3, 6));
    } else if (nomer.substring(0, 2) == "62") {
        return callback(nomer.substring(2, 5));
    } else if (nomer.substring(0, 1) == "0") {
        return callback(nomer.substring(1, 4));
    }
}

exports.cekKodeAwal = function (nomer, callback) {
    threeDigit(nomer, (tigadigit) => {
        Kodeawal.find({nomor: tigadigit}).distinct('operator')
        .then((kodeOperator) => {
            return callback(kodeOperator[0]);
        })
        .catch((err) => {
            console.log(err);
            return err;
        })
    })
}

