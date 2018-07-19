const mongoose = require('mongoose');
const User = mongoose.model('User');

const uuidv1 = require('uuid/v1');

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
                var sesi = uuidv1();
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
                dataId.save();
            }
        })
        .catch((err) => {
            console.log(err);
        })
    
}