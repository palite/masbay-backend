const mongoose = require('mongoose');

const Kodeawal = mongoose.model('Kodeawal');

function threeDigit(nomer, callback) {
    if (nomer.substring(0, 3) == "+62") {
        return callback(nomer.substring(3, 6));
    } else if (nomer.substring(0, 2) == "62") {
        return callback(nomer.substring(2, 5));
    } else if (nomer.substring(0, 1) == "0") {
        return callback(nomer.substring(1, 4));
    } else {
        return callback('999');
    }
}

exports.cekKodeAwal = function (nomer, callback) {
    threeDigit(nomer, (tigadigit) => {
        if (tigadigit != '999') {
            Kodeawal.find({nomor: tigadigit}).distinct('operator')
            .then((kodeOperator) => {
                if (kodeOperator) {
                    return callback(kodeOperator[0]);
                }  else {
                    return callback(false);
                }
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
        } else {
            return callback(false);
        }
    })
}

