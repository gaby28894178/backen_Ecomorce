const express = require("express");
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
} = require("../controllers/Usuario.controller");

const router = express.Router();

// 📋 Rutas
router.get("/", obtenerUsuarios);           // Obtener todos
router.get("/:id", obtenerUsuario);         // Obtener por ID
router.post("/", crearUsuario);             // Crear usuario
router.post("/login", loginUsuario);        // Login
router.put("/:id", actualizarUsuario);      // Actualizar nombre
router.delete("/:id", eliminarUsuario);     // Eliminar

module.exports = router;
