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
            if (hourDiff <=63 && hourDiff >= 58) {
                console.log('Kurang satu jam lagi');
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
                    console.log('Sudah masa expired');
            }
        }
    }) 
    TopUp.find()
    .then((data) => {
        var i;
        for (i = 0; i < data.length; i++){
            var end = moment(data[i].date,'YYYY-M-DD HH:mm:ss');
            var hourDiff = end.diff(now,"m");
            if (hourDiff <=63 && hourDiff >= 58) {
                console.log('Kurang satu jam lagi');
            } else if (data[i].status === 'Expired') {
               TopUp.findOneAndUpdate({price : data[i].price,status: "Expired"},{$set:{status:"Expiredx"}},function (err,info)  {
                   if (err) {
                       console.log("update eror");
                   } else {
                       console.log("update berhasil");
                   }
                   
               });
                // TopUp.update({price: data[i].price},{status: "terlalu_lama"});
                console.log('Sudah masa expired');
            }
        }
    }) 
    
    
}