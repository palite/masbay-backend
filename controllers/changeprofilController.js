const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.change = function (req,res)  {
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