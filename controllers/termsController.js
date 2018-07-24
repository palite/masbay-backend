const mongoose = require('mongoose');

const Terms = mongoose.model('Terms');
exports.term = function (callback) {
    Terms.find().sort({Alfabet: 1,Nomor:1})
    .then((listTerm) => {
       // listTerm.find().sort({Nomor: 1})
        //.then((list2Term)) => {
        return callback(listTerm);
       // }
    })
    .catch((err) => {
        console.log(err);
        return callback(false);
    })
}