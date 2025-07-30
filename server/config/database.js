// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    throw error;
  }
};

testConnection(); // Optional - you can remove if not needed globally

module.exports = sequelize;
