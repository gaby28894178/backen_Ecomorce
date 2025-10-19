const express = require("express");
const { loginUsuario } = require("../controllers/Usuario.controller");

const router = express.Router();

// Alias de autenticación: devuelve token JWT
router.post("/login", loginUsuario);

module.exports = router;