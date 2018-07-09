const mongoose = require('mongoose');

const SkemaHarga = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    denom: {
        type: Number,
        trim: true,
    },
    operator: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        trim: true,
    },
});

module.exports = mongoose.model('Harga', SkemaHarga);