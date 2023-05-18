const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Subscription = require("../models/subscription.schema");
const { Status } = require("../../../constants/status.constant");

exports.endSubscription = async (object) => {
    try {
        const {
            status = "complete",
            metadata: { subscription, type = "SUBSCRIPTION_END" },
        } = object;

        const subscriptionData = await Subscription.findOne({
            _id: subscription,
        });

        if (type === "SUBSCRIPTION_END" && status === "complete") {
            const deleted = await stripe.subscriptions.del(
                subscriptionData.subscription
            );
            await Subscription.updateOne(
                { _id: subscription },
                { $set: { status: Status.Inactive } }
            );
            return deleted;
        } else {
            throw new Error(
                "Either subscription not end or payment not completed"
            );
        }
    } catch (error) {
        throw error;
    }
};
