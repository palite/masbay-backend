const mongoose = require('mongoose');
const User = mongoose.model('User');

const uuidv1 = require('uuid/v1');

exports.signOut = function (req,res) {
    var sesi = uuidv1();
    User.findOneAndUpdate({session: req.body.session}, {$set:{session:null}},{new:true}, function(err,doc){
        if (err){
            console.log("Logout gagal");
        }
         else if (doc != null){
            console.log(doc);
            var data = {
                "isloggedout" : true
            }
            res.send(data);
        }   
    });
}