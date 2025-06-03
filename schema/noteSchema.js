const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, required: false },
    content: {type : String, required: false},
    subject: {type: String, required: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    assignedDate: {type: Date, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    calendarId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Calendar',
        required: true
    }
});

// Virtual field to calculate the day of the week based on `assignedDate`
noteSchema.virtual('assignedDay').get(function(){
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[new Date(this.assignedDate).getDay()]
})

module.exports = mongoose.model('Note', noteSchema);
