const User = require("../../../models/user/user.schema");
const Payment = require("../models/payment_succeeded.schema");
const Subscription = require("../models/subscription.schema");

exports.paymentSucceeded = async (object) => {
    try {
        const { customer_email, subscription, billing_reason } = object;
        const user = await User.findOne({ email: customer_email });
        let sub;
        if (billing_reason === "subscription_create") {
            sub = await new Subscription({
                user: user._id,
                subscription,
                status: "ACTIVE",
            }).save();
        } else {
            sub = await Subscription.findOne({
                subscription,
            });
        }
        const payment = new Payment({
            subscription: sub._id,
            payment: object,
        });
        return await payment.save();
    } catch (error) {
        throw error;
    }
};
