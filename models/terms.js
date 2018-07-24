const mongoose = require('mongoose');

const SkemaTerms = new mongoose.Schema({
    alfabet : {
        type:String,
        trim:true
    },
    topik: {
        type: String,
        trim: true,
    },
    nomor: {
        type: Number,
        trim: true,
    },
    isi : {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Terms', SkemaFAQ);