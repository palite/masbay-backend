const mongoose = require('mongoose');

const Transaksi = mongoose.model('Transaksi');

exports.cekTransaksi = function (arrStatus, callback) {
    let date1monthago = new Date();
    date1monthago.setTime(date1monthago.getTime() - (1000 * 60 * 60 * 24 * 30));
    //cari price yang mungkin ada dlm list crawler cek mutasi selama periode sebulan
    Transaksi.find({status: {$in: arrStatus}, date:{$gte: date1monthago}}).distinct('price')
    .then((arrHargaPending) => {
        return callback(arrHargaPending);
    })
    .catch((err) => {
        console.log(err);
        return err;
    })
}

exports.simpanTransaksi = function (denom, nomor, bayar, operator, harga, uniqprice, deviceId, callback) {
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
        transaksi.user = deviceId;
        transaksi.save()
        .then((TransaksiSukses) => {
            pesanTransaksiSukses(denom, nomor, bayar, operator, harga, uniqprice, date3hour, (pesan) => {
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

function pesanTransaksiSukses(denom, nomor, bayar, operator, harga, uniqprice, date3hour, callback) {
    let hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    let bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let jam = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    let menit = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
    let namaHarga = harga[0].name.substring(0,1).toLowerCase() + harga[0].name.substring(1);
    return callback("Pembelian "+ namaHarga + " untuk "+ nomor +" dengan "+ bayar+ " sejumlah Rp " + uniqprice + ",00 (diskon Rp " + (harga[0].price - uniqprice) + ") BERHASIL.\nHarap melakukan transfer ke rekening BNI berikut: 0427222248 (a.n Muhammad Habibullah) paling lambat pukul " + jam[date3hour.getHours()] + "." + menit[date3hour.getMinutes()] + " hari " + hari[date3hour.getDay()] + ", " + date3hour.getDate() + " " + bulan[date3hour.getMonth()] + " " + date3hour.getFullYear() + ".\nMohon transfer sesuai dengan jumlah transfer agar dapat diproses secara otomatis." + "*n");
}

exports.suksesIsiPulsa = function (paidTransaction, callback) {
    Transaksi.update({_id : paidTransaction[0]._id}, {status: 'Success'})
    .then((SuksesIsiPulsa) => {
        //console.log(SuksesIsiPulsa);
        let PesanSukses = "Pengisian pulsa " + paidTransaction[0].phone + " sukses!" ;
        return callback(PesanSukses);
    })
    .catch((err) => {
        console.log(err);
        let PesanError = "Pulsa mungkin sudah terisi namun pencatatan transaksi gagal. Nomor HP: " . pt[0].phone;
        return callback(PesanError);
    })
}

exports.ambilTransaksiTerbayar = function (harga, callback) {
    Transaksi.find({status:'Waiting', price: harga})
    .then((paidTransaction) => {
        return callback(paidTransaction);
    })
    .catch((err) => {
        console.log("Pencarian data transaksi dari harga yang ditemukan gagal! Mungkin ada data yg tidak sinkron pada database")
        return callback(err);
    })
}

exports.updateStatusTransaksi = function() {
    let dateNow = new Date();
    Transaksi.updateMany({status:'Waiting', date:{$lte: dateNow}}, {status:'Expired'})
    .then((UpdatedTransaksi) => {
        //console.log(UpdatedTransaksi);
        //console.log('Update status transaksi');
    })
    .catch((err) => {
        console.log(err);
        console.log('Error update status transaksi');
    });
}


exports.tanggalRiwayatTransaksi = function (user, callback) {
    Transaksi.find({user: user}).distinct('date')
    .then((tanggal) => {
        //edit tanggal
        let i;
        let hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
        let bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
        arrTanggal = new Array();
        let k = 0;
        for (i=0;i<tanggal.length;i++) {
            let originDate = new Date(tanggal[i]);
            let day = hari[originDate.getDay()];
            let date = originDate.getDate();
            let month = bulan[originDate.getMonth()];
            let year = originDate.getFullYear();
            var fullDate = day + ", "+ date + " " + month + " " + year;
            let kembar = false;
            for (j=0;j<i;j++) {
                if (fullDate == arrTanggal[j]) {
                    kembar = true;
                }
            }
            if (kembar == false) {
                arrTanggal[k] = fullDate;
                k++;
            }
            kembar = false;
        }
        return callback(arrTanggal);
    })
    .catch((err) => {
        console.log(err);
        return callback (false);
    })
}

exports.riwayatTransaksi = function (user, date, callback) {
    let date1;
    let date2;
    if (date == '') {
        date1 = new Date(1999, 12, 31, 23, 59, 59);
        date2 = new Date(2049, 12, 31, 23, 59, 59);
    } else  {
        let dd = (date.substring(0,2));
        let mm = (date.substring(2,4));
        let yyyy = parseInt(date.substring(4,8));
        date1 = new Date(yyyy+'-'+mm+'-'+dd+'T00:00:00');
        date2 = new Date(yyyy+'-'+mm+'-'+dd+'T23:59:59');
        dateNow = new Date();
    }
    Transaksi.find({user: user, date: {$gte: date1/*+1hari*/, $lte: date2}}).sort({date: -1}).lean()
    .then((RiwayatTransaksi) => {
        //edit tanggal
        let i;
        let hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
        let bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
        let jam = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
        let menit = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
        arrRiwayatTransaksi = new Array();
        for (i=0;i<RiwayatTransaksi.length;i++) {
            arrRiwayatTransaksi[i] = RiwayatTransaksi[i];
            let originDate = new Date(RiwayatTransaksi[i].date);
            let day = hari[originDate.getDay()];
            let date = originDate.getDate();
            let month = bulan[originDate.getMonth()];
            let year = originDate.getFullYear();
            var fullDate = day + ", "+ date + " " + month + " " + year;
            let hour = jam[originDate.getHours()];
            let minutes = menit[originDate.getMinutes()];
            var time = hour + "." + minutes;
            (arrRiwayatTransaksi[i])["fullDate"] = fullDate;
            (arrRiwayatTransaksi[i])["time"] = time;
        }
        return callback(arrRiwayatTransaksi);
    })
    .catch((err) => {
        return callback(err);
    })
}

exports.transaksiTerakhir = function (user, callback) {
    Transaksi.find({user: user}).sort({date: -1})
    .then((TransaksiTerakhir) => {
        return callback(TransaksiTerakhir);
    })
    .catch((err) => {
        return callback(err);
    })
}

exports.simpanTransaksiSaldo = function (denom, nomor, operator, saldo, harga, user, callback) {
    //simpan data harga ke dalam request yang akan disimpan ke dalam database
    const transaksi = new Transaksi();
    transaksi.operator = operator;
    transaksi.price = harga[0].price;
    transaksi.date = new Date();
    
    //dari dialogflow
    transaksi.status = 'Success';
    transaksi.phone = nomor;
    transaksi.denom = denom;
    transaksi.channel = 'Saldo';
    transaksi.user = user;
    transaksi.save()
    .then((TransaksiSukses) => {
        return callback('Pengisian pulsa sejumlah Rp ' + denom + ',00 ke nomor ' + nomor + ' sukses!\nMohon menunggu beberapa saat untuk pengisian pulsa secara otomatis.\nSisa saldo anda sejumlah : Rp ' + saldo + ',00.');
    }) 
    .catch((err) => {
        console.log(err);
        return callback('Maaf! Terdapat error POST data transaksi ke database');
    }); 
}