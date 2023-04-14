const mongoose = require('mongoose');

const disasterReliefSchema = new mongoose.Schema(
    {
        disasterNature: String, // Nature of the disaster
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        supportNumber: Number, // Estimated number of support workers or disaster victims that need to be served
        placementDate: Date, // Date and time the unit will be placed
        placementLocation: { // Where the unit will be placed
            type: { type: String, default: "Point" }, // Default value of "Point" for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        originPoint: { // Where the Origin Point
            type: { type: String, default: "Point" }, // Default value of "Point" for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        distanceFromKelowna: Number, // Distance from the center of Kelowna in kilometers
        serviceCharge: Number, // Service charge per km beyond a certain distance
        deliveredPrice: { type: Number, default: 0 }, // Price for delivering the unit, default value of 0
        hazards: String, // Hazards associated with the disaster, if any
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        specialRequirements: String, // Any other special requirements
        numUnits: Number // Number of units required for the construction site
    },
    { timestamps: true }
);

const DisasterRelief = mongoose.model('DisasterRelief', disasterReliefSchema);

module.exports = DisasterRelief;



