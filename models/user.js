const mongoose = require('mongoose');

const SkemaUser = new mongoose.Schema({
    identitas: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    saldo: {
        type: Number,
        default: 0,
        trim: true,
        
    },
    session: {
        type: String,
        trim: true,
        default: null
    },
    nama: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('User', SkemaUser);