const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const apiResponse = require("../../helpers/apiResponse");
const User = require("../../models/user/user.schema");
const Subscription = require("./models/subscription.schema");
const Payment = require("./models/payment_succeeded.schema");
const { Status } = require("../../constants/status.constant");
const { PaymentMode } = require("../../constants/payment_mode.constant");
const Tracking = require('../../models/tracking/tracking.schema');

exports.createCustomer = async (req, res) => {
    try {
        const { email } = req.userData.user;
        const user = await User.findOne({ email });
        const { stripe_customer_id } = user;
        if (!!stripe_customer_id) {
            return apiResponse.successResponseWithData(
                res,
                "Stipe costomer already exist",
                { customer: stripe_customer_id }
            );
        }
        const customer = await stripe.customers.create({
            email,
        });
        const { id } = customer;
        await User.updateOne({ email }, { $set: { stripe_customer_id: id } });
        return apiResponse.successResponseWithData(
            res,
            "Stipe costomer created successfully"
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.createCheckoutSession = async (req, res) => {
    try {
        const { email } = req.userData.user;
        const user = await User.findOne({ email });
        const { stripe_customer_id } = user;
        if (!stripe_customer_id) {
            return apiResponse.ErrorResponse(res, "Stripe customer does not exist");
        }

        const {
            price = 0,
            product_name = "",
            product_description = "",
            interval = "month",
            shipping_amount = 0,
            success_url = "",
            cancel_url = "",
            quotationId = "",
            quotationType = "",
        } = req.body;

        const encodedQuotationId = encodeURIComponent(quotationId);
        const encodedQuotationType = encodeURIComponent(quotationType);

        const session = await stripe.checkout.sessions.create({
            // success_url: !!success_url ? success_url : process.env.SUCCESS_URL,
            success_url: success_url + "?quotationId=" + encodedQuotationId + "&quotationType=" + encodedQuotationType,
            cancel_url: !!cancel_url ? cancel_url : process.env.CANCEL_URL,
            customer: stripe_customer_id,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: price * 100,
                        product_data: {
                            name: product_name,
                            description: product_description,
                        },
                        recurring: {
                            interval,
                        },
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: shipping_amount * 100,
                        product_data: {
                            name: "Shipping charges",
                            description: "$1 * distance",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: PaymentMode.Subscription,
            metadata: {
                quotationId: encodedQuotationId,
                quotationType: encodedQuotationType,
            },
        });

        const { id, url } = session;

        return apiResponse.successResponseWithData(
            res,
            "Stripe session created successfully",
            { id, url, stripe_customer_id }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

  

exports.getSubscriptionList = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        let { limit = 10, page = 1 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;
        const totalSubscription = await Subscription.countDocuments({
            user: _id,
        });
        const subscriptions = await Subscription.find({ user: _id })
            .populate({ path: "user", model: "User" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalSubscription / limit);

        return apiResponse.successResponseWithData(
            res,
            "Subscription fetched successfully",
            {
                subscriptions,
                totalPages,
                currentPage: page,
                perPage: limit,
                totalSubscription,
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getSubscriptionPaymentList = async (req, res) => {
    try {
        let { limit = 10, page = 1 } = req.query;
        let { subscriptionId } = req.params;

        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;
        const totalPayment = await Payment.countDocuments({
            subscription: subscriptionId,
        });
        const payments = await Payment.find({ subscription: subscriptionId })
            .populate({
                path: "subscription",
                model: "Subscription",
                populate: { path: "user", model: "User" },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        for (const payment of payments) {

            const quotationType = payment.subscription?.quotationType;
            const quotationId = payment.subscription?.quotationId.toString();

            if(quotationType && quotationId) {

                const quoteModel = require(`../../models/${quotationType.toLowerCase()}/${quotationType.toLowerCase()}.schema`);
                const quotation = await quoteModel.findById(quotationId);

                console.log(quotation);

                // payment.costDetails = quotation.costDetails;
                payments.push({costDetails: quotation.costDetails});
            }
            
        }

        const totalPages = Math.ceil(totalPayment / limit);

        return apiResponse.successResponseWithData(
            res,
            "Payment fetched successfully",
            {
                payments,
                totalPages,
                currentPage: page,
                perPage: limit,
                totalPayment,
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.endSubscription = async (req, res) => {
    try {
        const {
            subscriptionID,
            pickup_charge,
            product_name,
            success_url = "",
            cancel_url = "",
        } = req.body;
        const subscription = await Subscription.findOne({
            _id: subscriptionID,
        });
        if (subscription.status === Status.INACTIVE) {
            return apiResponse.ErrorResponse(res, "Subscription already ended");
        }

        const { email } = req.userData.user;
        const user = await User.findOne({ email });
        const { stripe_customer_id } = user;
        if (!stripe_customer_id) {
            return apiResponse.ErrorResponse(res, "Stipe costomer not exist");
        }

        const encodedQuotationId = encodeURIComponent(subscription.quotationId);
        const encodedQuotationType = encodeURIComponent(subscription.quotationType);

        const session = await stripe.checkout.sessions.create({
            success_url: !!success_url ? success_url : process.env.SUCCESS_URL,
            success_url: success_url + "?quotationId=" + encodedQuotationId + "&quotationType=" + encodedQuotationType,
            cancel_url: !!cancel_url ? cancel_url : process.env.CANCEL_URL,
            customer: stripe_customer_id,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: pickup_charge * 100,
                        product_data: {
                            name: `Pickup charges for ${product_name}`,
                            description: "$1 * distanse",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                subscription: subscriptionID,
                type: "SUBSCRIPTION_END",
            },
            mode: PaymentMode.Payment,
        });
        const { id, url, customer } = session;
        return apiResponse.successResponseWithData(
            res,
            "Subscription end in-progress",
            { id, url, customer }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.getSubscriptionListForAdmin = async (req, res) => {
    try {
        let { limit = 10, page = 1, status } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;

        let query = {};
        if (status) {
            query.status = status;
        }

        const totalSubscription = await Subscription.countDocuments(query);
        const subscriptions = await Subscription.find(query)
            .populate({ path: "user", model: "User" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const subscriptionIds = subscriptions.map(subscription => subscription._id);

        const trackingDetails = await Tracking.find({ subscriptionId: { $in: subscriptionIds } });

        const formattedSubscriptions = subscriptions.map(subscription => {
            const subscriptionId = subscription._id;
            const subscriptionTracking = trackingDetails.find(tracking => tracking.subscriptionId.equals(subscriptionId));
            const trackingId = subscriptionTracking ? subscriptionTracking._id : null;
            return {
                ...subscription.toObject(),
                trackingId,            };
        });

        const totalPages = Math.ceil(totalSubscription / limit);

        return apiResponse.successResponseWithData(
            res,
            "Subscription fetched successfully",
            {
                formattedSubscriptions,
                totalPages,
                currentPage: page,
                perPage: limit,
                totalSubscription,
            }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};
