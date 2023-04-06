const express = require("express");
const authRouter = require('../controller/auth/auth.routes')
const productRouter = require('../controller/products/product.routes')
const orderRouter = require('../controller/order/order.routes')
const notificationRouter = require('../controller/notification/notification.routes')
const app = express();

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/notification", notificationRouter);

module.exports = app;