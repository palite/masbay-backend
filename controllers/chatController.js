var pembelian_controller = require('../controllers/pembelianController');
const mongoose = require('mongoose');
const Session = mongoose.model('Session');

///session
const uuidv1 = require('uuid/v1');

exports.chat = function (req, res) {
    var apiai = require('apiai');
    if (req.body.text == "reset" || req.body.text == "Reset") {
        res.send("Mau beli apa hari ini?");
        var sesi = uuidv1();
        Session.findOneAndUpdate({deviceId: req.body.deviceId}, {$set:{session:sesi}},{upsert:true,new:true}, function(err,doc){
            if (err){
                console.log("Update sesi gagal");
            }
            console.log(doc);
        });
    }
    else if (req.body.text != "reset"){
        console.log('hahaha');  
        var kk = apiai(process.env.TOKENAPIAI);
        Session.find({deviceId: req.body.deviceId})
        .then((data) => {
            console.log(data[0].session);
            var request = kk.textRequest(req.body.text, {
                sessionId: data[0].session,
            });
            //menerima input dari api.ai
            request.on('response', function(response) {
                var respond = response.result.fulfillment.speech;
                var kode1 = respond.indexOf("*ok*");
                var kode2 = respond.indexOf("*wk*");
                //console.log(typeof arrayrespond);
                //kondisi saat rincian pembelian
                if (kode1 != -1) {
                    var arrayrespond = respond.split(",");
                    //console.log(response.result.contexts[3]);
                    var denom = arrayrespond[2];
                    var nomer = arrayrespond[1];
                    //var operator = response.result.contexts[3].parameters.operator[0];
                    var bayar = arrayrespond[3];
                    //console.log(denom,nomer,bayar);
                    bayar += "BNI";
                    pembelian_controller.konfirmasiPembelian(denom, nomer, bayar, (pesan) => {
                        res.send(pesan);
                    });
                }
                else if (kode2 != -1) {
                    var arrayrespond = respond.split(",");
                    //console.log(response.result.contexts[3]);
                    var denom = arrayrespond[2];
                    var nomor = arrayrespond[1];
                    //var operator = response.result.contexts[3].parameters.operator[0];
                    var bayar = arrayrespond[3];
                    pembelian_controller.prosesPembelian(denom, nomor, bayar, req.body.deviceId, (pesan) => {
                        res.send(pesan);
                    })
                    var sesiupdate = uuidv1();
                    Session.findOneAndUpdate({deviceId: req.body.deviceId}, {$set:{session:sesiupdate}},{new:true}, function(err,doc){
                        if (err){
                            console.log("Update sesi gagal");
                        }
                        console.log(doc);
                    });
                }
                else {
                //console.log(response.result.contexts[0].name);
                //console.log(response.result.metadata.intentName);
                res.send(response.result.fulfillment.speech);
                }
                });
                request.on('error', function(error) {
                    console.log(error);
                });
                request.end(); 

        })
        .catch((err) => {
            console.log(err);
        })
    }      
}