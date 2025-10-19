// const Joi = require("joi");
// const User = require("../models/User.modelo");

// // Validación
// const userSchema = Joi.object({
//   name: Joi.string().min(3).max(50).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
//   role: Joi.string().valid("admin", "user"),
//   estado: Joi.boolean()
// });

// // Crear usuario
// const crearUsuario = async (req, res) => {
//   try {
//     const { error, value } = userSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const usuario = await User.create(value);
//     res.status(201).json(usuario);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error creando usuario" });
//   }
// };

// // Obtener todos
// const obtenerUsuarios = async (req, res) => {
//   try {
//     const usuarios = await User.getAll();
//     res.json(usuarios);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error obteniendo usuarios Estamos en el controlador " });
//   }
// };

// // Obtener por ID
// const obtenerUsuario = async (req, res) => {
//   try {
//     const usuario = await User.getOne(req.params.id);
//     if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
//     res.json(usuario);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error obteniendo usuario" });
//   }
// };

// // Actualizar usuario
// const actualizarUsuario = async (req, res) => {
//   try {
//     const usuario = await User.update(req.params.id, req.body);
//     if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
//     res.json(usuario);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error actualizando usuario" });
//   }
// };

// // Eliminar usuario
// const eliminarUsuario = async (req, res) => {
//   try {
//     const usuario = await User.delete(req.params.id);
//     if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
//     res.json({ message: "Usuario eliminado correctamente" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error eliminando usuario" });
//   }
// };

// module.exports = {
//   crearUsuario,
//   obtenerUsuarios,
//   obtenerUsuario,
//   actualizarUsuario,
//   eliminarUsuario
// };
