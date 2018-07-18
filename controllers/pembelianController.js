var harga_controller = require('../controllers/hargaController');
var kodeawal_controller = require('../controllers/kodeAwalController');
var transaksi_controller = require('../controllers/transaksiController');

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

exports.konfirmasiPembelian = function (denom, nomer, bayar, callback) {
    kodeawal_controller.cekKodeAwal(nomer, (operator) => {
        if (operator) {
            harga_controller.cekHarga(denom, operator, (harga) => {
                if (harga) {
                    let pesanKonfirmasi = "Pembelian "+ operator+ " sejumlah " + denom + " untuk "+ nomer +" dengan "+ bayar+ " sejumlah Rp " + harga + ",00. Apakah anda yakin ? (y/n)*yn";
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

exports.prosesPembelian = function (denom, nomer, bayar, callback) {
    kodeawal_controller.cekKodeAwal(nomer, (operator) => {
        harga_controller.cekHarga(denom, operator, (harga) => {
            transaksi_controller.cekTransaksiPending((arrHargaPending) => {
                generateKodeBayar(arrHargaPending, harga, (uniqprice) => {
                    if (uniqprice == 50) {
                        return callback('Maaf! Server sedang sibuk menangani pembelian. Silahkan coba beberapa saat lagi.'); //random number tidak mungkin membuat kode unik setelah 50x loop
                    } else {
                        transaksi_controller.simpanTransaksi(denom, nomer, bayar, operator, uniqprice, (pesanSukses) => {
                            return callback(pesanSukses);
                        })
                    }
                })
            })
        })
    })
}