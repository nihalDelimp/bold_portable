require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes');
const passport = require('passport');
const strategy = require('./config/jwtOptions');
const bodyParser = require('body-parser');
const db = require("./models/index");

// configuration of the rest API
// app.use(cors());
app.use(cors({
    origin: '*'
}));

// Database synchorization with different Modals
db.sequelize.sync();

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// use the strategy
passport.use("strategy" , strategy);

//routes
app.use('/', authRoutes);

// Serve the public assets to all authenticated users
app.use('/public', express.static(__dirname + '/public'));

//index page
app.get('/', function(_req, res) {
	res.status(404);
	res.sendFile(path.join(__dirname+ "/public/index.html"));
});

// throw 404 if URL not found
app.all("*", function(_req, res) {
	res.status(404);
	res.sendFile(path.join(__dirname+ "/public/404.html"));
});

module.exports = app;
