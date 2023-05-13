const router = require("express").Router();
const stripeConteoller = require("./stripe.controller");
const checkAuth = require("../../middleware/checkAuth");
const { hasRole } = require("../../middleware/checkRole");
const { createStripeCheckoutValidation, endStripeCustomerValidation } = require("./stripe.schema");
const { validate } = require("../../validators/validate");

router.post(
    "/create-customer",
    checkAuth,
    hasRole("USER"),
    stripeConteoller.createCustomer
);
router.post(
    "/checkout-session",
    checkAuth,
    hasRole("USER"),
    createStripeCheckoutValidation(),
    validate,
    stripeConteoller.createCheckoutSession
);
router.post(
    "/end-subscription",
    checkAuth,
    hasRole("USER"),
    endStripeCustomerValidation(),
    validate,
    stripeConteoller.endSubscription
);

// History
router.get(
    "/subscription",
    checkAuth,
    stripeConteoller.getSubscriptionList
);
router.get(
    "/subscription/:subscriptionId",
    checkAuth,
    stripeConteoller.getSubscriptionPaymentList
);
module.exports = router;
