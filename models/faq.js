const mongoose = require('mongoose');

const SkemaFAQ = new mongoose.Schema({
    nomor: {
        type: Number,
        trim: true,
    },
    pertanyaan: {
        type: String,
        trim: true,
    },
    jawaban: {
        type: String,
        trim: true,
    },
});

module.exports = mongoose.model('Faq', SkemaFAQ);