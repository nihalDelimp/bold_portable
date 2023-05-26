const User = require("../../../models/user/user.schema");
const Payment = require("../models/payment_succeeded.schema");
const Subscription = require("../models/subscription.schema");
const logger = require("../../../helpers/logger.js");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.paymentSucceeded = async (object) => {
    try {
        const { customer_details, subscription, payment_status } = object;
        const user = await User.findOne({ email: customer_details.email });
        let sub;
        if (payment_status === "paid") {
            
            sub = await new Subscription({
                user: user._id,
                subscription,
                quotationId: object.metadata.quotationId,
                quotationType: object.metadata.quotationType,
                status: "ACTIVE",
            }).save();
        } else {
            sub = await Subscription.findOne({
                subscription,
            });
        }

        const invoice = await stripe.invoices.retrieve(
            object.invoice
        );

        const payment = new Payment({
            subscription: sub._id,
            payment: invoice,
        });
        return await payment.save();
    } catch (error) {
        throw error;
    }
};
