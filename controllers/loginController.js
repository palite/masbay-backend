const mongoose = require('mongoose');
const User = mongoose.model('User');

const uuidv1 = require('uuid/v1');

exports.logIn = function (req,res) {
    sesi = uuidv1();
    User.findOneAndUpdate({identitas: req.body.userId,password:req.body.password}, {$set:{session:sesi}},{new:true}, function(err,doc){
        if (err){
            console.log("Logout gagal");
        }
        console.log(doc);
        if (doc != null){
            User.find({identitas: req.body.userId}).distinct('nama')
            .then((nama) => {
                var data = {
                    "session" : sesi,
                    "name" : nama[0],
                    "isloggedin" : true
                }    
                res.send(data);
            })
        }
        else {
            var data = {
                "isloggedin" : false
            }
            res.send(data);
        }
        
    });
}
    
