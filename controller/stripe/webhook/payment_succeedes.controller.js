const User = require("../../../models/user/user.schema");
const Payment = require("../models/payment_succeeded.schema");
const Subscription = require("../models/subscription.schema");
const logger = require("../../../helpers/logger.js");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.paymentSucceeded = async (object) => {

    try {

        const subscriptiontest = await stripe.subscriptions.retrieve(
            object.subscription
        );

        const priceId = subscriptiontest.items.data[0].plan.id;

        const pricetest = await stripe.prices.retrieve(
            priceId
        );

        const prod_uid = pricetest.product;

        const product = await stripe.products.retrieve(
            prod_uid
        );

        const { customer_email, subscription, status } = object;

        const user = await User.findOne({ email: customer_email });
        let sub;
        if (status === "paid") {
            console.log('sdkksjkd', object);
            sub = await new Subscription({
                user: user._id,
                subscription,
                quotationId: product.metadata.quotationId,
                quotationType: product.metadata.quotationType,
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
        console.log(error);
        throw error;
    }
};
