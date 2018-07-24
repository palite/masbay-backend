const mongoose = require('mongoose');

const SkemaTransaksi = new mongoose.Schema({
    operator: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    denom: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        trim: true,
    },
    date: {
        type: Date,
        trim: true,
    },
    user: {
        type: String,
        trim: true,
        default: null
    },
    deviceId:{
        type:String,
        trim:true
    },
    status: {
        type: String,
        default: 'Pending',
        trim: true,
    },
    channel: {
        type: String,
        default: 'Transfer', //diganti kalau sudah mau develop pembayaran via saldo
        trim: true,
    },
});

module.exports = mongoose.model('Transaksi', SkemaTransaksi);