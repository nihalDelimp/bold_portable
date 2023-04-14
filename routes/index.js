const express = require("express");
const authRouter = require('../controller/auth/auth.routes')
const productRouter = require('../controller/products/product.routes')
const orderRouter = require('../controller/order/order.routes')
const notificationRouter = require('../controller/notification/notification.routes')
const quotationRouter = require('../controller/quotations/quotations.routes')
const app = express();

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/notification", notificationRouter);
app.use("/quotation", quotationRouter)

module.exports = app;