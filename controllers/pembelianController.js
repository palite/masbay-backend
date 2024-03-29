var harga_controller = require('../controllers/hargaController');
var kodeawal_controller = require('../controllers/kodeAwalController');
var transaksi_controller = require('../controllers/transaksiController');
var topup_controller = require('../controllers/topUpController');
var user_controller = require('../controllers/userController');
var mail_controller = require('../controllers/emailController');
const mongoose = require('mongoose');
const User = mongoose.model('User');
var api_pulsatop = require('../api/pulsatop');
/*var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    name: 'smtp2go',
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user:  process.env.USEREMAIL,
        pass:  process.env.MAILPASS
    }
}) */

function generateKodeBayar(range, arrHarga, harga, callback) {
    let i = 0; //untuk iterate loop
    let rand; //untuk generate angka random
    let uniqprice; //untuk simpan variabel harga unik
    let cekuniq; //unit variable boolean pengecek harga yang unik

    do {
        rand = Math.floor((Math.random() * range) + 1); //generate random number antara 1-range
        uniqprice = harga - rand; //tambahkan price dengan random number
        cekuniq = arrHarga.indexOf(uniqprice); // cek harga unik pada array object
        i++;
        if (i==range) { //harga tidak mungkin unik, database penuh dgn kode unik
            uniqprice = range;
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

exports.konfirmasiPembelian = function (denom, nomer, bayar, callback) {
    kodeawal_controller.cekKodeAwal(nomer, (operator) => {
        if (operator) {
            harga_controller.cekHarga(denom, operator, (harga) => {
                if (harga) {
                    let pesanKonfirmasi = "Pembelian "+ harga[0].name + " untuk "+ nomer +" dengan "+ bayar+ " seharga Rp " + harga[0].price + ",00.\nApakah anda yakin ? (y/n)*yn";
                    return callback(pesanKonfirmasi);
                } else {
                    return callback('Input nominal salah! Cari harga yang tersedia!');
                }
            })
        } else {
            return callback('Input nomor salah!');
        }
    })
}

exports.prosesPembelian = function (denom, nomer, bayar, user,session,callback) {
    kodeawal_controller.cekKodeAwal(nomer, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {
            transaksi_controller.cekTransaksi(['Waiting', 'Success'], (arrTransaksi) => {
                topup_controller.cekTopUp(['Waiting', 'Success'], (arrTopUp) => {
                    user_controller.ambilDataUser(user, (identitas) => {
                        let arrHarga = arrTopUp.concat(arrTransaksi);
                        generateKodeBayar(50, arrHarga, harga[0].price, (uniqprice) => {
                            if (uniqprice == 50) {
                                return callback('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.'); //random number tidak mungkin membuat kode unik setelah 50x loop
                            } else {
                                let idUser;
                                if (identitas) {
                                    idUser = identitas;
                                } else {
                                    idUser = user;
                                }
                                transaksi_controller.simpanTransaksi(denom, nomer, bayar, operator, harga, uniqprice, idUser, (pesanSukses) => {
                                    User.find({session:session}) 
                                    .then((doc) => {
                                        if (doc[0] == null) {
                                            console.log("user tidak login saat membeli");
                                        } 
                                        else {
                                            
                                            console.log(doc[0]);
                                            mail_controller.email(doc[0].identitas,pesanSukses.slice(0,-2));
                                            /*var mailOptions = {
                                                from: 'adminGanteng@masbay.com',
                                                to : doc[0].identitas,
                                                subject : "Data pembelian pulsa anda",
                                                text : pesanSukses.slice(0,-2)
                                            }
                                            console.log(mailOptions);
                                            smtpTransport.sendMail(mailOptions, function(error,info){
                                                if (error) {
                                                    console.log(error);
                                                    
                                                } else {
                                                    //console.log('Message sent: %s', info.messageId);
                                                    // Preview only available when sending through an Ethereal account
                                                    //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                                    console.log(info);
                                                   
                            
                                                }
                                            });*/
                                            
                                        } 
                                    })
                                    
                                    return callback(pesanSukses);
                                })   
                            }
                        })
                    })
                })
            })
        })
    })
}

exports.prosesTopUp = function (saldo, session, callback) {
    transaksi_controller.cekTransaksi(['Waiting', 'Success'], (arrTransaksi) => {
        topup_controller.cekTopUp(['Waiting', 'Success'], (arrTopUp) => {
            let arrHarga = arrTopUp.concat(arrTransaksi);
            let charge = 1000;
            let saldocharged = parseInt(saldo)+charge;
            generateKodeBayar(100, arrHarga, saldocharged, (uniqsaldo) => {
                if (uniqsaldo != 100) {
                    //cari data user dgn session dr parameter
                    user_controller.ambilDataUser(session, (user) => {
                        topup_controller.simpanTopUp(saldo, uniqsaldo, user, (pesan) => {
                            User.find({session:session}) 
                            .then((doc) => {
                                if (doc[0] == null) {
                                    console.log("user tidak login saat membeli");
                                } 
                                else {
                                    mail_controller.email(doc[0].identitas,pesan.slice(0,-2));
                                    /*var mailOptions = {
                                        from: 'adminGanteng@masbay.com',
                                        to : doc[0].identitas,
                                        subject : "Data pembelian pulsa anda",
                                        text : pesan.slice(0,-2)
                                    }
                                    console.log(mailOptions);
                                    smtpTransport.sendMail(mailOptions, function(error,info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            //console.log('Message sent: %s', info.messageId);
                                            // Preview only available when sending through an Ethereal account
                                            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                            console.log(info);
                                            
                    
                                        }
                                    });*/
                                    
                                } 
                            })
                            return callback(pesan);
                        })
                    })
                } else {
                    return callback('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.'); //random number tidak mungkin membuat kode unik setelah 100x loop
                }
            })
        })
    })
}

exports.cekSaldo = function (denom, nomor, session, callback) {
    kodeawal_controller.cekKodeAwal(nomor, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {        
            user_controller.cekSaldoCukup(harga[0].price, session, (cukup) => {
                if ((cukup) && (cukup != 'Error')) {
                    let pesanKonfirmasi = "Pembelian "+ harga[0].name + " untuk "+ nomor +" dengan saldo seharga Rp " + harga[0].price + ",00.\nApakah anda yakin ? (y/n)*yn";
                    return callback(pesanKonfirmasi);
                } else {
                    return callback('Saldo tidak cukup / tidak ada!');
                }
            })
        })
    })
}

exports.isiViaSaldo = function (denom, nomor, session, callback) {
    kodeawal_controller.cekKodeAwal(nomor, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {        
            api_pulsatop.isiViaSaldo(denom, nomor, operator, (code) => {
                if (code == '2') {
                    console.log("Saldo denom admin habis");
                    return callback('pulsatop error');
                } else {
                    //kurangin saldo user pake session, output saldo sekarang + identitas user
                    user_controller.kurangiSaldo(harga[0].price, session, arrUser => {
                        //update status pembelian ke sukses
                        transaksi_controller.simpanTransaksiSaldo(denom, nomor, operator, arrUser[0].saldo, harga, arrUser[0].identitas, (pesan) => {
                            return callback(pesan);
                        })
                    })
                }
            })
        })
    })
}