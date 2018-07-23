const mongoose = require('mongoose');
const User = mongoose.model('User');
var randomstring = require("randomstring");
//const VerifEmail = mongoose.model('VerifEmail');

const uuidv1 = require('uuid/v1');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    name: 'smtp2go',
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user:  process.env.USEREMAIL,
        pass:  process.env.MAILPASS
    }
})
var bcrypt = require('bcrypt-nodejs');
exports.forget = function(req,res) {
    var random = randomstring.generate(8);
    var hash = bcrypt.hashSync(random);
    User.find({identitas: req.body.userId})
    .then((doc) => {
        if (doc[0] == null) {
            var data = {
                "exist" : false
            }
            res.send(data);
        }
        else {
                var mailOptions = {
                from: ' MasBay :3<adminGanteng@masbay.com>',
                to : req.body.userId,
                subject : "Password barumu",
                html : "Hai, <br> password baru anda adalah  "+random+" <br> Harap ganti password anda setelah login."
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
                        "exist" : true
                    }
                    res.send(data);

                }
            });
            User.findOneAndUpdate({identitas : req.body.userId}, {$set:{password : hash}},{new :true},function (err,info){
                if (err) {
                    console.log("update database eror");
                }
                console.log(info);
            })
        }
    }) 

    
}