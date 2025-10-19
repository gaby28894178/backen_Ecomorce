const { Sequelize } = require('sequelize');
require('dotenv').config();

const url = process.env.DATABASE_URL;
const useSSL = (process.env.DATABASE_SSL === 'true') || /sslmode=require/.test(url || '');

const sequelize = new Sequelize(url, {
  logging: false,
  dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {}
});

module.exports = sequelize