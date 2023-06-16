const User = require("../../../models/user/user.schema");
const Payment = require("../models/payment_succeeded.schema");
const Subscription = require("../models/subscription.schema");
const logger = require("../../../helpers/logger.js");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const qrcode = require('qrcode');
const mailer = require("../../../helpers/nodemailer");

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

        const serviceUrl = process.env.APP_URL+'/services?quotationType=' + product.metadata.quotationType + '&quotationId=' +product.metadata.quotationId;

        const dataURL = await qrcode.toDataURL(serviceUrl);

        if (status === "paid") {

            sub = await new Subscription({
                user: user._id,
                subscription,
                quotationId: product.metadata.quotationId,
                quotationType: product.metadata.quotationType,
                status: "ACTIVE",
                qrCode: dataURL
            }).save();
        } else {
            sub = await Subscription.findOne({
                subscription,
            });
        }

        const mailOptions = {
            from: 'hello@boldportable.com',
            to: customer_email,
            subject: 'QR Code for your Portable Rental',
            text: `Hi,\n\nPlease find the atached QR code to scan and redirect to the service page  \n\nThanks,\nBold Portable Team`,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: dataURL.split(';base64,').pop(),
                    encoding: 'base64'
                }
            ]
        };
        
        mailer.sendMail(mailOptions);

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
