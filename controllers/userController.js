const mongoose = require('mongoose');

const User = mongoose.model('User');

exports.ambilDataUser = function (session, callback) {
    User.find({session: session}).distinct('identitas')
    .then((arrIdentitasUser) => {
        return callback(arrIdentitasUser[0]);
    })
}

exports.isiSaldo = function (arrTopUp, callback) {
    User.find({identitas: arrTopUp[0].user}).distinct('saldo')
    .then((saldoNow) => {
        let saldoUpdated = saldoNow[0] + arrTopUp[0].saldo;
        User.findOneAndUpdate({identitas: arrTopUp[0].user}, {saldo: saldoUpdated})
        .then((isiSaldoSukses) => {
            return callback(isiSaldoSukses);
        })
        .catch((err) => {
            return callback('Error');
        })
    })
}