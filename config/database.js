const Sequelize = require('sequelize');

// configure this with your own parameters
const database = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    database: process.env.MYSQL_DB,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // dialectOptions: {
    //     ssl:'Amazon RDS'
    // },
    define: {
        timestamps: false
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en'
});

module.exports = database;
