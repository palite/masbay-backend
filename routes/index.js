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
var verif_email = require('../controllers/verifemailController');
var forget_pass = require('../controllers/forgetpassController');
var change_profil = require('../controllers/changeprofilController');
var menu_controller = require('../controllers/menuController');

require('../controllers/timerController');

router.get('/faq', menu_controller.faq);
router.get('/terms', menu_controller.terms);
router.get('/listHarga/:operator', harga_controller.listHarga);
router.post('/cekSaldo', menu_controller.cekSaldo);
router.post('/transaksiTerakhir', menu_controller.transaksiTerakhir);
router.post('/riwayatTransaksi', menu_controller.riwayatTransaksi);
router.post('/chat', chat_controller.chat);
router.post('/signup',signup_controller.signUp);
router.post('/signout',signout_controller.signOut);
router.post('/login',login_conroller.logIn);
router.post('/verifemail',verif_email.verifEmail);
router.post('/forget',forget_pass.forget);
router.post('/changepass',change_profil.changepass);
router.post('/changemail',change_profil.changemail);


module.exports = router;