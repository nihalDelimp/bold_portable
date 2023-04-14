const mongoose = require('mongoose');

const farmOrchardWinerySchema = new mongoose.Schema(
    {
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        max_workers: Number,
        weekly_hours: Number,
        placement_datetime: Date,
        placement_location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        night_use: Boolean,
        winter_use: Boolean,
        special_requirements: String,
        numUnits: Number // Number of units required for the construction site

    },
    { timestamps: true }
);
const FarmOrchardWinery = mongoose.model('FarmOrchardWinery', farmOrchardWinerySchema);

module.exports = FarmOrchardWinery;
