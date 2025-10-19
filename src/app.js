const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes');
const path = require('path');
const errorHandler = require('./utils/errorHandler');

const app = express();


app.use(express.json());
app.use(helmet({crossOriginResourcePolicy: false}));
app.use(cors());

// Ruta raíz para ver estado en Vercel y evitar 404
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', baseUrl: '/api/v1' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', router);
app.use(errorHandler);


module.exports = app;
