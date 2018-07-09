const mongoose = require('mongoose');

const SkemaKodeawal = new mongoose.Schema({
    operator: {
        type: String,
        trim: true,
    },
    nomor: {
        type: Number,
        trim: true,
    },
});

module.exports = mongoose.model('Kodeawal', SkemaKodeawal);