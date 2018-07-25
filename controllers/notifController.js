const mongoose = require('mongoose');

const Transaksi = mongoose.model('Transaksi');
const Transaksi1 = mongoose.model('Transaksi');
const TopUp = mongoose.model('TopUp');
const TopUp1 = mongoose.model('TopUp');
var moment = require('moment');
exports.notif = function  () {
    console.log('hoo');
    var dating = new Date();
    var now = moment(dating,'YYYY-M-DD HH:mm:ss');
    
    Transaksi.find()
    .then((data) => {
        var i;
        for (i = 0; i < data.length; i++){
            var end = moment(data[i].date,'YYYY-M-DD HH:mm:ss');
            var diff = moment.duration(end.diff(now));
            var hourDiff = diff.asMinutes();
<<<<<<< HEAD
            if (hourDiff <=63 && hourDiff >= 58) {
                console.log('Kurang satu jam lagi');
=======
            if (hourDiff <=68 && hourDiff >= 53) {
                console.log('wooooooooooy isi pulsamu');
>>>>>>> ea928a9cef668c6089978c0400f6b2d078bcda1e
            } else if (data[i].status === 'Expired') {
                Transaksi.findOneAndUpdate({price : data[i].price,status : "Expired"},{$set:{status:"Expiredx"}},function (err,info)  {
                    if (err) {
                        console.log("update eror");
                    } else {
                        console.log("update berhasil");
                    }
                    //console.log("hai");
                });
                // Transaksi.update({price: data[i].price},{$set:{status: "terlalu_lama"}});
<<<<<<< HEAD
                    console.log('Sudah masa expired');
=======
                    //console.log('WOOY LEWAT');
>>>>>>> ea928a9cef668c6089978c0400f6b2d078bcda1e
            }
        }
    }) 
    TopUp.find()
    .then((data) => {
        var i;
        for (i = 0; i < data.length; i++){
            var end = moment(data[i].date,'YYYY-M-DD HH:mm:ss');
            var hourDiff = end.diff(now,"m");
<<<<<<< HEAD
            if (hourDiff <=63 && hourDiff >= 58) {
                console.log('Kurang satu jam lagi');
=======
            if (hourDiff <=68 && hourDiff >= 53) {
                console.log('wooooooooooy isi saldomu');
>>>>>>> ea928a9cef668c6089978c0400f6b2d078bcda1e
            } else if (data[i].status === 'Expired') {
               TopUp.findOneAndUpdate({price : data[i].price,status: "Expired"},{$set:{status:"Expiredx"}},function (err,info)  {
                   if (err) {
                       console.log("update eror");
                   } else {
                       console.log("update berhasil");
                   }
                   
               });
                // TopUp.update({price: data[i].price},{status: "terlalu_lama"});
<<<<<<< HEAD
                console.log('Sudah masa expired');
=======
                //console.log('WOOY saldo LEWAT');
>>>>>>> ea928a9cef668c6089978c0400f6b2d078bcda1e
            }
        }
    }) 
    
    
}