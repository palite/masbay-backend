const mongoose = require('mongoose');
const User = mongoose.model('User');
const Transaksi = mongoose.model('Transaksi');
const TopUp = mongoose.model('TopUp');
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
             User.findOneAndUpdate({identitas: req.body.oldUserId,password: req.body.password}, {$set:{identitas: req.body.userId}}, function (err,info){
                if (err) {
                    console.log("eror,eror,eror,eror");
                } else if (info == null) {
                    var dataId = new User({
                        "identitas" : req.body.userId,
                        "password" : req.body.password,
                        "nama" : req.body.name
                    });
                    dataId.save();
                    console.log(info);
                } else {
                    console.log(info);
                    //tambah untuk update data user di db transaksi dan topup
                    Transaksi.updateMany({user : req.body.oldUserId}, {user: req.body.userId}, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            TopUp.updateMany({user:req.body.oldUserId}, {user: req.body.userId}, function (err, info) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('db user, transaksi, dan topup sudah diupdate');
                                }
                            })
                        }
                    })
                }
                
            }); 
            /* var dataId = new User({
                "identitas" : req.body.userId,
                "password" : req.body.password,
            });
            dataId.save(); */
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
