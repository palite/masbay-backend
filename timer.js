require('dotenv').config();

//DATABASE
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
clusterDB = process.env.DATABASE.substring(process.env.DATABASE.indexOf('@'), process.env.DATABASE.indexOf('?'));
mongoose.connection
    .on('connected', () => {
        console.log(`TIMER - Mongoose connection open on ${clusterDB}`);
    })
    .on('error', (err) => {
        console.log(`TIMER - Connection error: ${err.message}`);
    });

require('./models/index');

//var notif_controller = require('./controllers/notifController');
//notif_controller.notif();

var crawl_controller = require('./controllers/crawlController');
crawl_controller.crawler(cekmutasi => {
    crawl_controller.transaksi(cekmutasi, sudah => {
        crawl_controller.topup(cekmutasi, sudah2 => {
            if ((sudah) && (sudah2)) {
                console.log('sudah selesai crawl');
                process.exit();
            }
        });
    });
})