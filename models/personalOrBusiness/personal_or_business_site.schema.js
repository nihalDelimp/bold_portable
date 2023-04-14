const mongoose = require('mongoose');

const personalOrBusinessSchema = new mongoose.Schema(
    {
        useType: String,
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        maxWorkers: Number, // Largest number of workers utilizing the unit
        weeklyHours: Number, // Number of hours per week workers are on site
        placement_datetime: Date,
        placement_location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        originPoint: { // Where the Origin Point
            type: { type: String, default: "Point" }, // Default value of "Point" for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        distanceFromKelowna: Number, // Distance from the center of Kelowna in kilometers
        serviceCharge: Number, // Service charge per km beyond a certain distance
        deliveredPrice: { type: Number, default: 0 }, // Price for delivering the unit, default value of 0
        night_use: Boolean,
        winter_use: Boolean,
        special_requirements: String,
        numUnits: Number, // Number of units required for the construction site
        serviceFrequency: String, // How often the service is required
    },
    { timestamps: true }
);
const PersonalOrBusiness = mongoose.model('PersonalOrBusiness', personalOrBusinessSchema);

module.exports = PersonalOrBusiness;
