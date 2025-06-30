const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    profilePicture: {
        type: [String], // This is an array of String
        default: []
    },
    calendarId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calendar'
    }
}, {timestamps: true}); //Time stamp will save the time of changes into database

module.exports = mongoose.model('User', userSchema);