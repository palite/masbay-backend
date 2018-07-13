require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
clusterDB = process.env.DATABASE//.substring(process.env.DATABASE.indexOf('@'), process.env.DATABASE.indexOf('-'));
mongoose.connection
    .on('connected', () => {
        console.log(`Mongoose connection open on ${clusterDB}`);
    })
    .on('error', (err) => {
        console.log(`Connection error: ${err.message}`);
    });

//require('./models/Transaksi');
//require('./models/User');
var normalizedPath = require("path").join(__dirname, "models");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./models/" + file);
});

const app = require('./app');

const server = app.listen(process.env.PORT, () => {
    console.log(`Express is running on port ${server.address().port}`);
});
