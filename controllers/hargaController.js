const mongoose = require('mongoose');

const Harga = mongoose.model('Harga');

exports.cekHarga = function (denom, operator, callback) {
    Harga.find({denom: denom, operator: operator}).distinct('price')
    .then((hargaPulsa) => {
        return callback(hargaPulsa[0]);
    })
    .catch((err) => {
        console.log(err);
        return err;
    })
}

exports.listHarga = function (req, res) {
    Harga.find({operator: req.params.operator}).sort({'denom':1})
    .then((ListHargaOperator) => {
        res.json(ListHargaOperator);
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
}