const mongoose = require('mongoose');
const User = mongoose.model('User');

const uuidv1 = require('uuid/v1');

exports.logIn = function (req,res) {
    sesi = uuidv1();
    User.findOneAndUpdate({session: req.body.session,password:req.body.password}, {$set:{session:sesi}},{new:true}, function(err,doc){
        if (err){
            console.log("Logout gagal");
        }
        console.log(doc);
        var data = {
            "session" : sesi,
            "isloggedin" : true
        }
        res.send(data);
    });
}
    
