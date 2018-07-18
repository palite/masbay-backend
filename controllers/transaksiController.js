const mongoose = require('mongoose');

const Transaksi = mongoose.model('Transaksi');

exports.cekTransaksiPending = function (callback) {
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

exports.simpanTransaksi = function (denom, nomor, bayar, operator, uniqprice, callback) {
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

exports.riwayatTransaksi = function (req, res) {
    Transaksi.find({phone: req.params.nomor})
    .then((RiwayatTransaksi) => {
        res.json(RiwayatTransaksi);
    })
    .catch(() => {
        res.send('Maaf! Terdapat error.');
    })
}