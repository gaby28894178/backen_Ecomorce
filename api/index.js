const app = require('../src/app');
const sequelize = require('../src/utils/connection');

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      initialized = true;
      console.log('✅ DB sincronizada (Vercel serverless)');
    } catch (err) {
      console.error('❌ Error de DB en Vercel:', err);
    }
  }
  return app(req, res);
};