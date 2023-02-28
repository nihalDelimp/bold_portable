//Sequelize seeder with AWS Config.
module.exports = {
  development: {
    username: 'root',
    password: 'root',
    database: 'bold_portable',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: '0',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DB,
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    operatorsAliases: '0',
    // dialectOptions: {
    //   ssl: 'Amazon RDS'
    // },
  }
};
