var pembelian_controller = require('../controllers/pembelianController');
const mongoose = require('mongoose');
const Session = mongoose.model('Session');

///session
const uuidv1 = require('uuid/v1');
    /*var session = uuidv1();
    setInterval(
        function() {
            session = uuidv1();
        }
        , 120000); */

exports.chat = function (req, res) {
    let bay = true;
    var apiai = require('apiai');
    if (req.body.text == "reset") {
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
                        pembelian_controller.prosesPembelian(denom, nomor, bayar, (pesan) => {
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

//Akses ke Wit.Ai

const {Wit, log} = require('node-wit');
const client = new Wit({
   accessToken: process.env.TOKENWIT,
   //loggers: new log.loggers(log.DEBUG)
});

exports.talk = function (req, res) {
    var aa = req.body.text;
    client.message(aa, {})
    .then((data) => {
        res.send(JSON.stringify(data));
        //console.log(JSON.stringify(data));
        //var son = JSON.parse(data);
        /* if (data.entities.jumlah_denom != null) {
            var nom = data.entities.jumlah_denom[0].value;
            var k = true;}
        else {
            var k = false;
        }
        if (data.entities.type_pulsa != null)  {
            var ope = data.entities.type_pulsa[0].value;
            var l = true;
        }
        else {
                var l = false;
        }
        if (k && l) {res.send(nom+ope);}
        if (l == false && k) {res.send(nom+"operator tidak diketahui");}
        if (l && k == false) {res.send(ope+"denom tidak ada");} */
    })       
}