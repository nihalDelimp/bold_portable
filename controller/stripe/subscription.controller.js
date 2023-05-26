const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const apiResponse = require("../../helpers/apiResponse");
const User = require("../../models/user/user.schema");
const Subscription = require("./models/subscription.schema");
const Payment = require("./models/payment_succeeded.schema");
const { Status } = require("../../constants/status.constant");
const { PaymentMode } = require("../../constants/payment_mode.constant");
const Tracking = require('../../models/tracking/tracking.schema');

exports.getDetails = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId)
            .populate({ path: "user", model: "User" });

        if (!subscription) {
            return apiResponse.notFoundResponse(res, "Subscription not found");
        }

        const quotationType = subscription.quotationType;
        const quoteModel = require(`../../models/${quotationType.toLowerCase()}/${quotationType.toLowerCase()}.schema`);
        const quotation = await quoteModel.findById(subscription.quotationId);

        const tracking = await Tracking.find({ subscriptionId: subscriptionId });

        subscription.quotation = quotation;
        subscription.tracking = tracking;

        return apiResponse.successResponseWithData(res, "Subscription detail fetched successfully", {
            subscription, quotation, tracking
        });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
