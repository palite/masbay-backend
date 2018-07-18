const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Transaksi = mongoose.model('Transaksi');

//timer update status transaksi
function updateStatusTransaksi() {
    let dateNow = new Date();
    Transaksi.updateMany({status:'Pending', date:{$lte: dateNow}}, {status:'Expired'})
    .then((UpdatedTransaksi) => {
        //console.log(UpdatedTransaksi);
    })
    .catch((err) => {
        console.log(err);
        console.log('Error update status transaksi');
    });
}

updateStatusTransaksi();
setInterval(updateStatusTransaksi, 60000); //req setiap 1/2 menit

function updatePembayaran(){

    Transaksi.find({status:'Pending'}).distinct('price')
    .then((TransaksiPending) => {
        var request = require("request");
        var options = {
            method: 'GET',
            url: process.env.CRAWLER,
            headers: 
            { 'Cache-Control': 'no-cache' }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
        
            //console.log(JSON.stringify(body));
            var cekmutasi = JSON.stringify(body);
            var errcrawler = cekmutasi.search("Kesalahan");
            if (errcrawler == 1) { //kesalahan crawler
                console.log("Crawler bank BNI failed to get data!");
            } else {
                console.log("Crawler berhasil");
                ////------------------------------------------------////
                ///////////////////////Editor Rupiah////////////////////
                ////------------------------------------------------////
                Number.prototype.formatRupiah = function(c, d, t){
                    var n = this, 
                    c = isNaN(c = Math.abs(c)) ? 2 : c, 
                    d = d == undefined ? "." : d, 
                    t = t == undefined ? "," : t, 
                    s = n < 0 ? "-" : "", 
                    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
                    j = (j = i.length) > 3 ? j % 3 : 0;
                   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
                };
                ////------------------------------------------------////
                ////////////////////////////////////////////////////////
                ////------------------------------------------------////
                var i;
                for (i = 0; i < TransaksiPending.length; i++) { 
                    var cekprice = TransaksiPending[i].formatRupiah(0, ',', '.'); //edit 5850 -> 5.850 
                    cekprice = '' + cekprice + ',00';
                    //console.log(cekprice);
                    var trfketemu = cekmutasi.search(cekprice); //cek array, ada yang sama dengan array[i] kah
                    //console.log(trfketemu);
                    if (trfketemu == -1) { // gak ketemu
                        //console.log('gagal, coba lagi!');
                    } else { //ketemu
                        //console.log('ketemu!');
                        //ambil seluruh data dr price tsb
                        Transaksi.find({status:'Pending', price: TransaksiPending[i]})
                        .then((paidTransaction) => {
                            //Kirim ke API

                            const axios = require("axios");
                            var qs = require("qs");
                            let pt = paidTransaction;
                            
                            //axios raw code
                            axios({
                                method: 'POST',
                                url: process.env.APIPULSATOP,
                                params: {
                                    key: process.env.KEY,
                                },
                                data: qs.stringify({ 
                                    operator: pt[0].operator,
                                    phone: pt[0].phone,
                                    secret: process.env.SECRET,
                                    denom: pt[0].denom 
                                })
                            })
                            .then(function(response){
                                console.log(response.data);
                                console.log(response.status);
                                if (response.data.status == 'error') {
                                    console.log("Akses ke API pulsatop gagal");
                                } else {
                                    //update status pembelian ke sukses
                                    Transaksi.update({_id : pt[0]._id}, {status: 'Success'})
                                    .then((SuksesIsiPulsa) => {
                                        //console.log(SuksesIsiPulsa);
                                        let PesanSukses = "Pengisian pulsa " + pt[0].phone + " sukses!" ;
                                        console.log(PesanSukses);
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        let PesanError = "Pulsa mungkin sudah terisi namun pencatatan transaksi gagal. Nomor HP: " . pt[0].phone;
                                        console.log(PesanError);
                                    })
                                }
                            })
                            .catch((err) =>{
                                console.log(err);
                                console.log("Akses ke API pulsatop gagal");
                            });         
                        }) 
                        .catch((err) => {
                            console.log(err);
                            console.log("Pencarian data transaksi dari harga yang ditemukan gagal! Mungkin ada data yg tidak sinkron pada database")
                        })
                    }                    
                }
            }
        });
    })
    .catch((err) => {
        console.log(err);
        console.log("gagal mendapat data transaksi yg pending pada database. cek konfigurasi database");
    })
}
//updatePembayaran();
setInterval(updatePembayaran, 300000); //req setiap x / 1000 detik

//////////////////////////////////////////////////////////
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

var harga_controller = require('../controllers/hargaController');
var transaksi_controller = require('../controllers/transaksiController');
var chat_controller = require('../controllers/chatController');

router.get('/listHarga/:operator', harga_controller.listHarga);
router.get('/riwayatTransaksi/:nomor', transaksi_controller.riwayatTransaksi);
router.post('/chat', chat_controller.chat);

//////////////////////////////////////////////////////////////////////

//Akses ke Wit.Ai

const {Wit, log} = require('node-wit');
const client = new Wit({
   accessToken: process.env.TOKENWIT,
   //loggers: new log.loggers(log.DEBUG)
});

router.post('/ngomong',
    (req,res) => {
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
)

module.exports = router;