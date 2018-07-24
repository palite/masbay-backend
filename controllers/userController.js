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
        let saldoUpdated = saldoNow[0] + parseInt(arrTopUp[0].saldo);
        User.findOneAndUpdate({identitas: arrTopUp[0].user}, {saldo: saldoUpdated})
        .then((isiSaldoSukses) => {
            console.log(isiSaldoSukses);
            return callback(isiSaldoSukses);
        })
        .catch((err) => {
            return callback('Error');
        })
    })
}

exports.cekSaldo = function (session, callback) {
    User.find({session: session}).distinct('saldo')
    .then((saldo) => {
        return callback(saldo[0].toString());
    })
    .catch((err) => {
        return callback('Error');
    })
}

exports.cekSaldoCukup = function (bayar, session, callback) {
    User.find({session: session}).distinct('saldo')
    .then((saldoNow) => {
        if (saldoNow[0] >= parseInt(bayar)) {
            return callback(true);
        } else {
            return callback(false);
        }
    })
    .catch((err) => {
        return callback('Error');
    })
}

exports.kurangiSaldo = function (harga, session, callback) {
    //find update return saldo sekarang + identitas user
    User.find({session:session}).distinct('saldo')
    .then((saldoLama) => {
        let saldoBaru = saldoLama[0] - harga;
        User.findOneAndUpdate({session:session}, {saldo: saldoBaru})
        .then(() => {
            User.find({session:session})
            .then((dataUser) => {
                return callback(dataUser);
            })
            .catch((err) => {
                console.log(err);
                return callback(err);
            })
        })
        .catch((err) => {
            console.log(err);
            return callback(err);
        })
    })
    .catch((err) => {
        console.log(err);
        return callback(err);
    })
}