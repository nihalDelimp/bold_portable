const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'quotationType'
    },
    quotationType: {
      type: String,
      required: true,
      enum: ['Construction', 'DisasterRelief', 'FarmOrchardWinery', 'PersonalOrBusiness']
    },
    address: {
      type: String,
      required: true
    },
    driver_name: {
      type: String,
      required: true
    },
    driver_phone_number: {
      type: String,
      required: true
    },
    // Add more fields as needed
  },
  { timestamps: true }
);

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;