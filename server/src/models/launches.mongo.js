
const mongoose = require('mongoose');

//Learning note, SchemaTypes : https://mongoosejs.com/docs/schematypes.html#schematypes

const launchesSchema = mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    customers: [ String ],
    upcoming: {
        type: Boolean,
        required: true,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    }
});

//Connects launchesSchema with the launches collection.
module.exports = mongoose.model('Launch', launchesSchema);