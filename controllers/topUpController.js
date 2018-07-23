const mongoose = require('mongoose');

const TopUp = mongoose.model('TopUp');

exports.cekTopUp = function (arrStatus, callback) {
    let date1monthago = new Date();
    date1monthago.setTime(date1monthago.getTime() - (1000 * 60 * 60 * 24 * 30));
    //cari price yang mungkin ada dlm list crawler cek mutasi selama periode sebulan
    TopUp.find({status: {$in: arrStatus}, date:{$gte: date1monthago}}).distinct('price')
    .then((arrHargaPending) => {
        return callback(arrHargaPending);
    })
    .catch((err) => {
        console.log(err);
        return err;
    })
}

exports.simpanTopUp = function (saldo, uniqsaldo, user, callback) {
    tenggatBayar((date3hour) => {
        const topUp = new TopUp();
        topUp.saldo = saldo;
        topUp.user  = user;
        topUp.price = uniqsaldo;
        topUp.date = date3hour;

        topUp.save()
        .then(() => {
            pesanTopUpSukses(saldo, uniqsaldo, date3hour, (pesan) => {
                return callback(pesan);
            })
        })
        .catch((err) => {
            console.log(err);
            return callback('Maaf! Terdapat error POST data top up ke database');
        }); 
    })
}

function tenggatBayar(callback) {
    let date3hour = new Date();
    date3hour.setTime(date3hour.getTime() + (1000 * 10740)); //selisih 3 jam - 1 menit
    return callback(date3hour);
}

function pesanTopUpSukses(saldo, uniqsaldo, date3hour, callback) {
    let hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    let bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let jam = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    let menit = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
    let chargefix = uniqsaldo-saldo;
    let pesanKonfirmasi = "Pengisian saldo sejumlah Rp " + saldo + ",00\nBiaya administrasi sejumlah Rp "+ chargefix + ",00\nTOTAL :  Rp " + uniqsaldo + ",00.\nHarap melakukan transfer ke rekening BNI berikut: 0427222248 (a.n Muhammad Habibullah) paling lambat pukul " + jam[date3hour.getHours()] + "." + menit[date3hour.getMinutes()] + " hari " + hari[date3hour.getDay()] + ", " + date3hour.getDate() + " " + bulan[date3hour.getMonth()] + " " + date3hour.getFullYear() + ".\nMohon transfer sesuai dengan jumlah transfer agar dapat diproses secara otomatis." + "*n";
    return callback(pesanKonfirmasi);
}

exports.ambilTopUpSaldo = function (harga, callback) {
    TopUp.find({status:'Pending', price: harga})
    .then((paidTopUp) => {
        return callback(paidTopUp);
    })
    .catch((err) => {
        console.log("Pencarian data top up dari harga yang ditemukan gagal! Mungkin ada data yg tidak sinkron pada database");
        return callback(err);
    })
}

exports.suksesIsiSaldo = function (paidTopUp, callback) {
    TopUp.update({_id : paidTopUp[0]._id}, {status: 'Success'})
    .then((SuksesIsiSaldo) => {
        //console.log(SuksesIsiSaldo);
        let PesanSukses = "Pengisian saldo " + paidTopUp[0].user + " sukses!" ;
        return callback(PesanSukses);
    })
    .catch((err) => {
        console.log(err);
        let PesanError = "Saldo mungkin sudah terisi namun pencatatan transaksi gagal. User: " . paidTopUp[0].user;
        return callback(PesanError);
    })
}


exports.updateStatusTopUp = function() {
    let dateNow = new Date();
    TopUp.updateMany({status:'Pending', date:{$lte: dateNow}}, {status:'Expired'})
    .then((UpdatedTransaksi) => {
        //console.log(UpdatedTransaksi);
    })
    .catch((err) => {
        console.log(err);
        console.log('Error update status top up');
    });
}
