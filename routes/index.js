const express = require("express");
const authRouter = require('../controller/auth/auth.routes')
const productRouter = require('../controller/products/product.routes')
const orderRouter = require('../controller/order/order.routes')
const notificationRouter = require('../controller/notification/notification.routes')
const quotationRouter = require('../controller/quotations/quotations.routes')
const stripeRouter = require('../controller/stripe/subscriptions.routes')
const costManagement = require('../controller/saveCostQuotation/saveCostQuotation.routes')
const tracking = require('../controller/tracking/tracking.routes')
const app = express();

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/notification", notificationRouter);
app.use("/quotation", quotationRouter);
app.use("/stripe", stripeRouter);
app.use("/cost-management", costManagement);
app.use("/tracking", tracking);

module.exports = app;