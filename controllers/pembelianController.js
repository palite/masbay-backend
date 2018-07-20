var harga_controller = require('../controllers/hargaController');
var kodeawal_controller = require('../controllers/kodeAwalController');
var transaksi_controller = require('../controllers/transaksiController');
var topup_controller = require('../controllers/topUpController');
var user_controller = require('../controllers/userController');
var api_pulsatop = require('../api/pulsatop');

function generateKodeBayar(range, arrHargaPending, harga, callback) {
    let i = 0; //untuk iterate loop
    let rand; //untuk generate angka random
    let uniqprice; //untuk simpan variabel harga unik
    let cekuniq; //unit variable boolean pengecek harga yang unik

    do {
        rand = Math.floor((Math.random() * range) + 1); //generate random number antara 1-range
        uniqprice = harga - rand; //tambahkan price dengan random number
        cekuniq = arrHargaPending.indexOf(uniqprice); // cek harga unik pada array object
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
                    let pesanKonfirmasi = "Pembelian "+ operator+ " sejumlah " + denom + " untuk "+ nomer +" dengan "+ bayar+ " seharga Rp " + harga + ",00.\nApakah anda yakin ? (y/n)*yn";
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

exports.prosesPembelian = function (denom, nomer, bayar, deviceId, callback) {
    kodeawal_controller.cekKodeAwal(nomer, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {
            transaksi_controller.cekTransaksiPending((arrHargaPending) => {
                topup_controller.cekTopUpPending((arrTopUpPending) => {
                    let arrPending = arrTopUpPending.concat(arrHargaPending);
                    generateKodeBayar(50, arrPending, harga, (uniqprice) => {
                        if (uniqprice == 50) {
                            return callback('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.'); //random number tidak mungkin membuat kode unik setelah 50x loop
                        } else {
                            transaksi_controller.simpanTransaksi(denom, nomer, bayar, operator, harga, uniqprice, deviceId, (pesanSukses) => {
                                return callback(pesanSukses);
                            })
                        }
                    })
                })
            })
        })
    })
}

exports.prosesTopUp = function (saldo, session, callback) {
    topup_controller.cekTopUpPending((arrTopUpPending) => {
        transaksi_controller.cekTransaksiPending((arrHargaPending) => {
            let arrPending = arrTopUpPending.concat(arrHargaPending);
            let charge = 1000;
            let saldocharged = parseInt(saldo)+charge;
            generateKodeBayar(100, arrPending, saldocharged, (uniqsaldo) => {
                if (uniqsaldo != 100) {
                    //cari data user dgn session dr parameter
                    user_controller.ambilDataUser(session, (user) => {
                        topup_controller.simpanTopUp(saldo, uniqsaldo, user, (pesan) => {
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
            user_controller.cekSaldoCukup(harga, session, (cukup) => {
                if ((cukup) && (cukup != 'Error')) {
                    let pesanKonfirmasi = "Pembelian "+ operator+ " sejumlah " + denom + " untuk "+ nomor +" dengan saldo seharga Rp " + harga + ",00.\nApakah anda yakin ? (y/n)*yn";
                    return callback(pesanKonfirmasi);
                } else {
                    return callback('Saya tidak ingin menambah kekurangan (saldo) Anda. :)');
                }
            })
        })
    })
}

exports.isiViaSaldo = function (denom, nomor, session, callback) {
    kodeawal_controller.cekKodeAwal(nomor, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {        
            api_pulsatop.isiViaSaldo(denom, nomor, operator, (status) => {
                if (status == 'error') {
                    console.log("Akses ke API pulsatop gagal");
                    return callback('pulsatop error');
                } else {
                    //kurangin saldo user pake session, output saldo sekarang + identitas user
                    user_controller.kurangiSaldo(harga, session, arrUser => {
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