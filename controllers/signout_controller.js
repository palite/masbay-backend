const mongoose = require('mongoose');
const User = mongoose.model('User');

const uuidv1 = require('uuid/v1');

exports.signOut = function (req,res) {
    var sesi = uuidv1();
    User.findOneAndUpdate({session: req.body.session}, {$set:{session:sesi}},{new:true}, function(err,doc){
        if (err){
            console.log("Logout gagal");
        }
        console.log(doc);
    });
}