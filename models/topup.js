const mongoose = require('mongoose');

const SkemaTopUp = new mongoose.Schema({
    saldo: {
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
    },
    status: {
        type: String,
        default: 'Pending',
        trim: true,
    },
});

module.exports = mongoose.model('TopUp', SkemaTopUp);