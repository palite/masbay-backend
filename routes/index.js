const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Transaksi = mongoose.model('Transaksi');
const Harga = mongoose.model('Harga');
const Kodeawal = mongoose.model('Kodeawal');

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

const uuidv1 = require('uuid/v1');
var session = uuidv1();
setInterval(
    function() {
        session = uuidv1();
    }
    , 120000);

function konfirmasiPembelian(denom, nomer, bayar, callback) {
    cekKodeAwal(nomer, (operator) => {
        cekHarga(denom, operator, (harga) => {
            let pesanKonfirmasi = "Pembelian "+ operator+ " sejumlah " + denom + " untuk "+ nomer +" dengan "+ bayar+ " sejumlah Rp " + harga + ",00. Apakah anda yakin ? (y/n)*yn";
            return callback(pesanKonfirmasi);
        })
    })
}

function prosesPembelian(denom, nomer, bayar, callback) {
    cekKodeAwal(nomer, (operator) => {
        cekHarga(denom, operator, (harga) => {
            cekTransaksiPending((arrHargaPending) => {
                generateKodeBayar(arrHargaPending, harga, (uniqprice) => {
                    if (uniqprice == 50) {
                        return callback('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.'); //random number tidak mungkin membuat kode unik setelah 50x loop
                    } else {
                        simpanTransaksi(denom, nomer, bayar, operator, uniqprice, (pesanSukses) => {
                            return callback(pesanSukses);
                        })
                    }
                })
            })
        })
    })
}

function cekKodeAwal(nomer, callback) {
    threeDigit(nomer, (tigadigit) => {
        Kodeawal.find({nomor: tigadigit}).distinct('operator')
        .then((kodeOperator) => {
            return callback(kodeOperator[0]);
        })
        .catch((err) => {
            console.log(err);
            return err;
        })
    })
}

function threeDigit(nomer, callback) {
    if (nomer.substring(0, 3) == "+62") {
        return callback(nomer.substring(3, 6));
    } else if (nomer.substring(0, 2) == "62") {
        return callback(nomer.substring(2, 5));
    } else if (nomer.substring(0, 1) == "0") {
        return callback(nomer.substring(1, 4));
    }
}

function cekHarga(denom, operator, callback) {
    Harga.find({denom: denom, operator: operator}).distinct('price')
    .then((hargaPulsa) => {
        return callback(hargaPulsa[0]);
    })
    .catch((err) => {
        console.log(err);
        return err;
    })
}

function cekTransaksiPending(callback) {
    let date1monthago = new Date();
    date1monthago.setTime(date1monthago.getTime() - (1000 * 60 * 60 * 24 * 30));
    //cari price yang mungkin ada dlm list crawler cek mutasi selama periode sebulan
    Transaksi.find({status: {$in: ['Pending', 'Success']}, date:{$gte: date1monthago}}).distinct('price')
    .then((arrHargaPending) => {
        return callback(arrHargaPending);
    })
    .catch((err) => {
        console.log(err);
        return err;
    })
}

function generateKodeBayar(arrHargaPending, harga, callback) {
    let i = 0; //untuk iterate loop
    let rand; //untuk generate angka random
    let uniqprice; //untuk simpan variabel harga unik
    let cekuniq; //unit variable boolean pengecek harga yang unik

    do {
        rand = Math.floor((Math.random() * 50) + 1); //generate random number antara 1-50
        uniqprice = harga + rand; //tambahkan price dengan random number
        cekuniq = arrHargaPending.indexOf(uniqprice); // cek harga unik pada array object
        i++;
        if (i==50) { //harga tidak mungkin unik, database penuh dgn kode unik
            uniqprice = 50;
            break;
        }
        if (cekuniq != -1) { //ada harga yang kembar
            continue;
        } else if (cekuniq == -1) { //harga unik
            break;
        }
    } while (true);
    return callback(uniqprice);
}

function simpanTransaksi(denom, nomor, bayar, operator, uniqprice, callback) {
    tenggatBayar((date3hour) => {
        //simpan data harga ke dalam request yang akan disimpan ke dalam database
        const transaksi = new Transaksi();
        transaksi.operator = operator;
        transaksi.price = uniqprice;
        transaksi.date = date3hour;
        
        //dari dialogflow
        transaksi.phone = nomor;
        transaksi.denom = denom;
        transaksi.channel = bayar;
        transaksi.save()
        .then((TransaksiSukses) => {
            pesanTransaksiSukses(denom, nomor, bayar, operator, uniqprice, date3hour, (pesan) => {
                return callback(pesan);
            })
        }) 
        .catch((err) => {
            console.log(err);
            return callback('Maaf! Terdapat error POST data transaksi ke database');
        }); 
    })
}

function tenggatBayar(callback) {
    let date3hour = new Date();
    date3hour.setTime(date3hour.getTime() + (1000 * 10740)); //selisih 3 jam - 1 menit
    return callback(date3hour);
}

function pesanTransaksiSukses(denom, nomor, bayar, operator, uniqprice, date3hour, callback) {
    let hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    let bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let jam = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    let menit = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];

    return callback("Pembelian "+ operator+ " sebanyak " + denom + " untuk "+ nomor +" dengan "+ bayar+ " sejumlah Rp " + uniqprice + ",00. berhasil. Harap melakukan transfer ke rekening BNI berikut: 0427222248 (a.n Muhammad Habibullah) paling lambat pukul " + jam[date3hour.getHours()] + "." + menit[date3hour.getMinutes()] + " hari " + hari[date3hour.getDay()] + ", " + date3hour.getDate() + " " + bulan[date3hour.getMonth()] + " " + date3hour.getFullYear() + ". Mohon transfer sesuai dengan jumlah transfer agar dapat diproses secara otomatis." + "*n");
}
//////////////////////////////////////////////////////////
router.get('/listHarga/:operator', (req, res) => {
    Harga.find({operator: req.params.operator}).sort({'denom':1})
    .then((ListHargaOperator) => {
        res.json(ListHargaOperator);
    })
    .catch(() => {
        res.send("Maaf! Terdapat error.");
    })
});
//////////////////////////////////////////////////////////

const projectId = 'masbay-5e88e'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
//const query = 'hello';
const languageCode = 'en-US';

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
// variable penentuan kondisi transfer 
var bay = true;
router.post('/chat',
    (req,res) => {
        bay = true;
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
                console.log(denom,nomer,bayar);
                ////rapikan
                konfirmasiPembelian(denom, nomer, bayar, (pesan) => {
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
                prosesPembelian(denom, nomor, bayar, (pesan) => {
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
        
    })
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