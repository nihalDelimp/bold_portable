const express = require("express");
const authRouter = require('../controller/auth/auth.routes')
const app = express();

app.use("/auth", authRouter);

module.exports = app;