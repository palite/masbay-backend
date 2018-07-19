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
        trim: true,
    },
    session: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model('User', SkemaUser);