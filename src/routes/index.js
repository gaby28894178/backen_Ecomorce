const express = require("express");
const usuariosRoutes = require("./usuarios.rutes");
const productosRoutes = require("./productos.rutes");
const carritosRoutes = require("./carritos.rutes");
const authRoutes = require("./auth.rutes");
const router = express.Router();

router.use("/usuarios", usuariosRoutes);
router.use("/productos", productosRoutes);
router.use("/carritos", carritosRoutes);
router.use("/auth", authRoutes);

module.exports = router;
