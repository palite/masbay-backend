const mongoose = require('mongoose');

const SkemaSession = new mongoose.Schema({
    deviceId: {
        type: String,
        trim: true,
    },
    session: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model('Session', SkemaSession);