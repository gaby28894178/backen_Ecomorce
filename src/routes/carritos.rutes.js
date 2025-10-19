const express = require("express");
const { obtenerCarritoUsuario, agregarProducto, eliminarProducto, crearCarritoUsuario, obtenerTotalCarritoUsuario, comprarCarritoUsuario } = require("../controllers/Carrito.controller");
const { authRequired } = require("../utils/auth");

const router = express.Router();

// Crear carrito para un usuario (si no existe)
router.post("/crear", authRequired, crearCarritoUsuario);

// Obtener carrito de un usuario con items y productos
router.get("/usuario/:usuarioId", authRequired, obtenerCarritoUsuario);

// Nuevo: Obtener solo el total del carrito del usuario
router.get("/usuario/:usuarioId/total", authRequired, obtenerTotalCarritoUsuario);

// Agregar producto al carrito
router.post("/agregar", authRequired, agregarProducto);

// Checkout del carrito del usuario autenticado
router.post("/checkout", authRequired, comprarCarritoUsuario);

// Eliminar item del carrito
router.delete("/item/:carritoItemId", authRequired, eliminarProducto);

module.exports = router;