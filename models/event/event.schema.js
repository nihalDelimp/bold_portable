const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        eventDate: Date, // Date of the event
        eventType: String, // Type of event
        eventLocation: String, // Location of the event
        maxAttendees: Number, // Maximum number of attendees estimated to be at the event
        peakUseTimes: String, // Peak times of use, if any
        alcoholServed: Boolean, // Whether alcohol will be served at the event
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        vipSection: {
            payPerUse: Boolean, // Whether there will be pay per use VIP units on site
            fencedOff: Boolean, // Whether the VIP units will be fenced off
            activelyCleaned: Boolean // Whether the VIP units will be actively cleaned
        },
        numUnits: Number // Number of units required for the construction site
    },
    { timestamps: true }
);
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
