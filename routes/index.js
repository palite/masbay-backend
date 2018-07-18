const express = require('express');

const router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

var harga_controller = require('../controllers/hargaController');
var transaksi_controller = require('../controllers/transaksiController');
var chat_controller = require('../controllers/chatController');

require('../controllers/timerController');

router.get('/listHarga/:operator', harga_controller.listHarga);
router.get('/riwayatTransaksi/:nomor', transaksi_controller.riwayatTransaksi);
router.post('/chat', chat_controller.chat);
router.post('/talk', chat_controller.talk);

module.exports = router;