const mongoose = require('mongoose');

const farmOrchardWinerySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
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
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        special_requirements: String,
        numUnits: Number, // Number of units required for the construction site
        serviceFrequency: String, // How often the service is required
        special_requirements: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        },

    },
    { timestamps: true }
);
const FarmOrchardWinery = mongoose.model('FarmOrchardWinery', farmOrchardWinerySchema);

module.exports = FarmOrchardWinery;
