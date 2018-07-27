require('dotenv').config();

//DATABASE
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
clusterDB = process.env.DATABASE.substring(process.env.DATABASE.indexOf('@'), process.env.DATABASE.indexOf('?'));
mongoose.connection
    .on('connected', () => {
        console.log(`SCHEDULER - Mongoose connection open on ${clusterDB}`);
    })
    .on('error', (err) => {
        console.log(`SCHEDULER - Connection error: ${err.message}`);
    });

require('./models/index');

var transaksi_controller = require('./controllers/transaksiController');
var topup_controller = require('./controllers/topUpController');
var notif_controller = require('./controllers/notifController');
var crawl_controller = require('./controllers/crawlController');

transaksi_controller.updateStatusTransaksi();
topup_controller.updateStatusTopUp();
notif_controller.notif();
setInterval(transaksi_controller.updateStatusTransaksi, 10000); //req setiap x/1000 detik
setInterval(topup_controller.updateStatusTopUp, 10000); //req setiap x/1000 detik
setInterval(notif_controller.notif, 300000); //req setiap x/1000 detik



function crawl() {
    crawl_controller.crawler(cekmutasi => {
        crawl_controller.transaksi(cekmutasi, sudah => {
            crawl_controller.topup(cekmutasi, sudah2 => {
                
            });
        });
    })
}

function keepNotSleeping() {
    var request = require("request");
    var options = {
        method: 'GET',
        url: process.env.URLKEEPNOTSLEEP,
        headers: 
        { 'Cache-Control': 'no-cache' }
    };
    request(options, function (error, response, body) {
        console.log(body);
    })
}

function stop() {
    date = new Date();
    console.log(date);
    process.exit();
}

keepNotSleeping();
setInterval(crawl, 300000); //5 menit
setInterval(keepNotSleeping, 180000); //3 menit
setInterval(stop, 590000); //9 menit 50 detik