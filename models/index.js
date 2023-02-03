const database = require("../config/database");
const Sequelize = require("sequelize");
const User = require("./user/user.model")
const sequelize = database;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models
db.user = User(sequelize, Sequelize);
module.exports = db;