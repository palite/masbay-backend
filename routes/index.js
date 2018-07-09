const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Transaksi = mongoose.model('Transaksi');
const Harga = mongoose.model('Harga');
const Kodeawal = mongoose.model('Kodeawal');

//timer
/*function intervalFunc() {
    console.log('Cant stop me now!');
}
setInterval(intervalFunc, 2000);*/

router.get('/riwayatTransaksi', (req, res) => {
    Transaksi.find()
    .then((RiwayatTransaksi) => {
        res.json(RiwayatTransaksi);
    })
    .catch(() => {
        res.send('Maaf! Terdapat error.');
    });
});

router.get('/listHarga', (req, res) => {
    Harga.find().sort({'operator':1, 'denom':1})
    .then((ListHarga) => {
        res.json(ListHarga);
    })
    .catch(() => {
        res.send("Maaf! Terdapat error.");
    });
});

router.get('/listOperator', (req, res) => {
    Harga.find().distinct('operator')
    .then((ListOperator) => {
        res.send(ListOperator);
    })
    .catch((err) => {
        res.send(err);
    })
});

router.get('/listOperator/:prioritas', (req, res) => {
    Harga.find().distinct('operator')
    .then((ListOperator) => {
        let i = 0;
        while (true) {
            if (ListOperator[i] == req.params.prioritas) {
                //swap list operator prioritas
                let dummy = ListOperator[0];
                ListOperator[0] = req.params.prioritas;
                ListOperator[i] = dummy;
                break;
            } else {
                i++;
            }
            if (i == (ListOperator.length - 1)) {
                break; //antisipasi error typo URL akses ke API
            }
        }
        res.send(ListOperator);
    })
    .catch((err) => {
        res.send(err);
    })
});

router.get('/listHarga/:operator', (req, res) => {
    Harga.find({operator: req.params.operator}).sort({'denom':1})
    .then((ListHargaOperator) => {
        res.json(ListHargaOperator);
    })
    .catch(() => {
        res.send("Maaf! Terdapat error.");
    })
});

router.get('/listHarga/nomor/:nomor', (req, res) => {
    Kodeawal.find({nomor: req.params.nomor})
    .then((KodeNomor) => {
        Harga.find({operator: KodeNomor[0].operator}).sort({'denom':1})
        .then((ListHargaOperator) => {
            res.json(ListHargaOperator);
        })
        .catch(() => {
            res.send("Maaf! Terdapat error GET Harga.");
        });
    })
    .catch(() => {
        res.send("Maaf! Terdapat error GET Kode Awal.");
    });
});

router.post('/inputTransaksi', (req, res) => {
    //ambil data transaksi price yang sedang dalam proses (Pending) dari database
    Transaksi.find({status:'Pending'}).distinct('price')
    .then((HargaPending) => {
        //generate harga yang unik untuk setiap transaksi yang pending
        //pastikan tidak ada data price yang kembar di dalam database
        //ulangi generate harga sampai didapatkan harga yang unik dengan data harga di database
        let i = 0;
        do {
            let rand = Math.floor((Math.random() * 50) + 1); //generate random number antara 1-50
            var uniqprice = req.body.price - rand; //kurangi price dengan random number
            let cekuniq = HargaPending.indexOf(uniqprice); // cek harga unik pada array object
            i++;
            if (cekuniq != -1) { //ada harga yang kembar
                continue;
            } else if ((cekuniq == -1) || (i==50)) { //harga unik atau harga sudah tidak mungkin unik
                break;
            }
        } while (true);
        if (i!= 50) {
            //simpan data harga ke dalam request yang akan disimpan ke dalam database
            const transaksi = new Transaksi(req.body);
            transaksi.price = uniqprice;
            transaksi.save()
            .then((TransaksiSukses) => {
                res.send(TransaksiSukses);
            }) 
            .catch(() => {
                res.send('Maaf! Terdapat error POST data transaksi ke database');
            }); 
        } else {
            res.send('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.');
        }  
    })
    .catch(() => {
        res.send('Maaf! Terdapat error GET harga pending');
    });
});

router.post('/isiPulsa', (req, res) => {
    //Kirim ke API

    const axios = require("axios");
    var qs = require("qs");

    //json pengganti raw code disini

    //axios raw code
    axios({
        method: 'POST',
        url: 'https://api.pulsatop.com/partner/business/order',
        params: {
            key: process.env.KEY,
        },
        data: qs.stringify({ 
            operator: req.body.operator,
            phone: req.body.phone,
            secret: process.env.SECRET,
            denom: req.body.denom 
        })
    })
    .then(function(response){
        console.log(response.data);
        console.log(response.status);
    })
    .catch(function(error){
        console.log(error);
    });         
});

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
            //res.send((data));
                //console.log(JSON.stringify(data));
                //var son = JSON.parse(data);
                if (data.entities.jumlah_denom != null) {
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
            if(l == false && k) {res.send(nom+"operator tidak diketahui");}
            if(l && k == false) {res.send(ope+"denom tidak ada");}
       })       
   }
)

module.exports = router;