var transaksi_controller = require('../controllers/transaksiController');
var user_controller = require('../controllers/userController');

exports.riwayatTransaksi = function (req, res) {
    user_controller.ambilDataUser(req.body.session, user => {
        transaksi_controller.riwayatTransaksi(user, (arrRiwayat) => {
            if (arrRiwayat) {
                res.json(arrRiwayat);
            } else {
                res.send('Data session tidak ada dalam database! Login terlebih dahulu.')
            }
        })
    })
}

exports.transaksiTerakhir = function (req, res) {
    user_controller.ambilDataUser(req.body.session, user => {
        transaksi_controller.transaksiTerakhir(user, (arrTransaksi) => {
            if (arrTransaksi) {
                let i;
                let str = "";
                for (i=0; i < arrTransaksi.length; i++) {
                    str = str + (arrTransaksi[i].denom + " " + arrTransaksi[i].channel + " " + arrTransaksi[i].phone);
                    if (i < (arrTransaksi.length - 1)) {
                        str = str + "\n";
                    }
                    if (i == 2) {
                        break;
                    }
                }
                res.send(str);
            } else {
                res.send('Maaf! Terdapat error.');    
            }
        })
    })
}

exports.faq = function (req, res) {
    
}