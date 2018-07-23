const mongoose = require('mongoose');
const User = mongoose.model('User');
var nodemailer = require("nodemailer");
const VerifEmail = mongoose.model('VerifEmail');
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

exports.changepass = function (req,res)  {
    User.findOneAndUpdate({session : req.body.session,password : req.body.password}, {$set:{password:req.body.newpassword}}, {new : true} , function(err,info){
        if (err) {
            console.log("update gagal");
        }
        else if (info != null){
            var data = {
                "changed" : true
            }
            res.send(data);
        } else {
            var data = {
                "changed" : false
            }
            res.send(data);
        }
    })
}

exports.changemail = function (req,res) {
    User.find({session : req.body.session, password : req.body.password}) 
    .then((doc) => {
        if (doc[0] == null ) {
            var data = {
                "exist" : false
            }
            res.send(data);
        } else {
            var data = {
                "exist" : true
            }
            var random = Math.floor((Math.random()*8999)+1000);
            VerifEmail.findOneAndUpdate({identitas : req.body.userId,password : doc[0].password},{$set:{kode : random}},{upsert : true, new : true}, function (err,file) {
                if (err) {
                    console.log("update eror");
                }
                console.log(file);

            });
            
            
            
            var mailOptions = {
                from: ' MasBay :3<adminGanteng@masbay.com>',
                to : req.body.userId,
                subject : "Masukkan kode",
                html : "Hai, <br> Masukkan kode anda  "+random+" <br> kedalam hp anda."
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
                    res.send(data);

                }
            })   
            
        }
    })
}