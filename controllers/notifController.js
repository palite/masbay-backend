const mongoose = require('mongoose');

const Transaksi = mongoose.model('Transaksi');

const TopUp = mongoose.model('TopUp');
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
                console.log('wooooooooooy isi pulsamu');
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
                console.log('wooooooooooy isi pulsamu');
            }
        }
    }) 
    
    
}