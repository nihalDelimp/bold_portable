const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { server } = require('../../server');
const apiResponse = require("../../helpers/apiResponse");

exports.createSubscription = async (req, res) => {
    try {

        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: '4242424242424242',
                exp_month: 8,
                exp_year: 2024,
                cvc: '314',
            },
        });

        const customer = await stripe.customers.create({
            email: req.body.email,
            name: req.body.name,
            payment_method: paymentMethod.id,
            description: req.body.description ? req.body.description : '',
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            default_payment_method: paymentMethod.id,
            items: [
                {
                    price: 'price_1M1OzWSCAbofgHz86YmKmDHc',
                },
            ],
        });

        return apiResponse.successResponseWithData(
            res,
            "Subscription created successfully.",
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};