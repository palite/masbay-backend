const mongoose = require('mongoose');
const User = mongoose.model('User');
const VerifEmail = mongoose.model('VerifEmail');

const uuidv1 = require('uuid/v1');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    name: 'smtp2go',
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'kukuh.raharjo1923@gmail.com', // generated ethereal user
        pass: 'masbay' // generated ethereal password
    }
})

exports.signUp = function (req,res) {
    User.find({identitas: req.body.userId})
        .then((doc) => {
            if (doc[0] != null) {
                var data = {
                    "exist" : true
                }
                res.send(data);
            }
            else {
                var rand = Math.floor((Math.random()*9999)+1000);
                var mailOptions = {
                    from: 'adming@masbay.com',
                    to : req.body.userId,
                    subject : "Masukkan kode berikut ke hpmu nak",
                    html : "Hai, <br> Masukkan kode "+rand+" ke hpmu nak."
                }
                console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function(error,info){
                    if (error) {
                        console.log(error);
                        res.send("eror");
                    } else {
                        //console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        console.log(info);
                        var data = {
                            "exist" : false
                        }
                        res.send(data);

                    }
                });
                var verifData = new VerifEmail({
                    "identitas" : req.body.userId,
                    "password" : req.body.password,
                    "kode" : rand
                });
                verifData.save();

                /*var sesi = uuidv1();
                var data = {
                    "exist" : false,
                    "sessionId" : sesi
                }
                res.send(data);
                var dataId = new User({
                    "identitas" : req.body.userId,
                    "password" : req.body.password,
                    "saldo" : 0,
                    "session" : sesi
                });
                dataId.save(); */
            }
        })
        .catch((err) => {
            console.log(err);
        })
    
}