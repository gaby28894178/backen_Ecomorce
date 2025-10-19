const express = require("express");
const { crearProducto, obtenerProductos, obtenerProducto } = require("../controllers/Product.controller");
const { authRequired } = require("../utils/auth");

const router = express.Router();

router.get("/", obtenerProductos);         // Obtener todos los productos
router.get("/:id", obtenerProducto);        // Obtener producto por ID
router.post("/", authRequired, crearProducto); // Crear producto (protegido)

module.exports = router;