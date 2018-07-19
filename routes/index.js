const express = require('express');

const router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

var harga_controller = require('../controllers/hargaController');
var transaksi_controller = require('../controllers/transaksiController');
var chat_controller = require('../controllers/chatController');
var signup_controller = require('../controllers/signupController');
var signout_controller = require('../controllers/signoutController');
var login_conroller = require('../controllers/loginController');

require('../controllers/timerController');

router.get('/listHarga/:operator', harga_controller.listHarga);
router.get('/riwayatTransaksi/:nomor', transaksi_controller.riwayatTransaksi);
router.get('/transaksiTerakhir/:nomor', transaksi_controller.transaksiTerakhir);
router.post('/chat', chat_controller.chat);
router.post('/signup',signup_controller.signUp);
router.post('/signout',signout_controller.signOut);
router.post('/login',login_conroller.logIn);

module.exports = router;