const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");


const CountrySchema = new mongoose.Schema({
    num_code: {
        type: Number,
        required: true
    },
    alpha_2_code: {
        type: String,
        required: true
    },
    alpha_3_code: {
        type: String,
        required: true
    },
    en_short_name: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    }
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;