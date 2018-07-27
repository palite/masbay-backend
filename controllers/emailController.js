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

exports.email = function (receive,message) {
    var mailOptions = {
        from: 'MasBay :3 <adminGanteng@masbay.com>',
        to : receive,
        subject : "Masukkan kode berikut ke hpmu nak",
        text : message
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error,info){
        if (error) {
            console.log(error);
            //res.send("eror");
        } else {
            //console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            console.log(info);
            var data = {
                "exist" : false
            }
            //res.send(data);

        }
    });
}