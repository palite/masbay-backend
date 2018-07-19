const mongoose = require('mongoose');
const User = mongoose.model('User');
const VerifEmail = mongoose.model('VerifEmail');
var nodemailer = require("nodemailer");

const uuidv1 = require('uuid/v1');

exports.verifEmail = function (req,res) {
    var sesi = uuidv1();
    VerifEmail.findOneAndRemove({identitas: req.body.userId,kode: req.body.code}, function (err,doc){
        if (err) {
            console.log("verif gagal");
        }
        else if (doc != null) {
            var dataId = new User({
                "identitas" : req.body.userId,
                "password" : req.body.password,
                "saldo" : 0,
                "session" : sesi
            });
            dataId.save();
            var data = {
                "iscodetrue" : true
            }
            res.send(data);
        } else {
            var data = {
                "iscodetrue" : false
            }
            res.send(data);
        }
        
    });
}
