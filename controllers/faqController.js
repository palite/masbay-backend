const mongoose = require('mongoose');

const Faq = mongoose.model('Faq');

exports.faq = function (callback) {
    Faq.find().sort({Nomor: 1})
    .then((listFaq) => {
        return callback(listFaq);
    })
    .catch((err) => {
        console.log(err);
        return callback(false);
    })
}