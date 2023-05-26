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
      enum: ['Construction', 'DisasterRelief', 'FarmOrchardWinery', 'PersonalOrBusiness', 'Event']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: false
    },
    address: [{
      type: String,
    }],
    driver_name: {
      type: String,
      required: true
    },
    driver_phone_number: {
      type: String,
      required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'modified', 'cancelled'],
        default: 'pending'
    }
  },
  { timestamps: true }
);

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;