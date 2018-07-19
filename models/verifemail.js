const mongoose = require('mongoose');

const SkemaVerifEmail = new mongoose.Schema({
    identitas: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    kode: {
        type: Number,
        trim: true,
    }
});

module.exports = mongoose.model('VerifEmail', SkemaVerifEmail);