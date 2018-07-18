var pembelian_controller = require('../controllers/pembelianController');

///session
const uuidv1 = require('uuid/v1');
    var session = uuidv1();
    setInterval(
        function() {
            session = uuidv1();
        }
        , 120000);

exports.chat = function (req, res) {
    let bay = true;
    var apiai = require('apiai');
    
    var kk = apiai(process.env.TOKENAPIAI);
    
    var request = kk.textRequest(req.body.text, {
        sessionId: session,
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
    
}