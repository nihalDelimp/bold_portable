const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        eventDetails: {
            eventName: String, //Name of the event
            eventDate: Date, // Date of the event
            eventType: String, // Type of event
            eventLocation: String, // Location of the event
            eventMapLocation: {
                type: { type: String, default: "Point" },
                coordinates: { type: [Number], default: [0, 0] }
            }
        },
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        originPoint: { // Where the Origin Point
            type: { type: String, default: "Point" }, // Default value of "Point" for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        distanceFromKelowna: Number, // Distance from the center of Kelowna in kilometers
        serviceCharge: Number, // Service charge per km beyond a certain distance
        deliveredPrice: { type: Number, default: 0 }, // Price for delivering the unit, default value of 0
        maxWorkers: Number, // Largest number of workers utilizing the unit
        weeklyHours: Number, // Number of hours per week workers are on site
        peakUseTimes: { type: Boolean, default: false }, // Peak times of use, if any
        peakTimeSlot: { type: String, default: null },
        alcoholServed: Boolean, // Whether alcohol will be served at the event
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        vipSection: {
            payPerUse: { type: Boolean, default: false }, // Whether there will be pay per use VIP units on site
            fencedOff: { type: Boolean, default: false }, // Whether the VIP units will be fenced off
            activelyCleaned: { type: Boolean, default: false } // Whether the VIP units will be actively cleaned
        },
        numUnits: Number, // Number of units required for the construction site
        serviceFrequency: String, // How often the service is required
        special_requirements: String
    },
    { timestamps: true }
);
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
