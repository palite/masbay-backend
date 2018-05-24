const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('Registration', registrationSchema);