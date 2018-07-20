const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.change = function (req,res)  {
    User.findOneAndUpdate({session : req.body.session}, {$set:{password:req.body.newpassword}}, {new : true} , function(err,info){
        if (err) {
            console.log("update gagal");
        }
        var data = {
            "exist" : true
        }
        res.send(data);
    })
}