const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.modelo");
const catchError = require("../utils/catchError");

// 🔹 Esquema de validación de usuario con Joi
const userSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user').optional(),
  estado: Joi.boolean().optional(),
});

// 🟢 Crear usuario
const crearUsuario = catchError(async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const nuevoUsuario = await User.create({
    nombre: value.nombre,
    email: value.email,
    password: value.password,
    role: value.role ?? 'user',
    estado: value.estado ?? true,
  });

  const { password, ...usuarioSeguro } = nuevoUsuario.toJSON();
  res.status(201).json(usuarioSeguro);
});

// 🟢 Obtener todos los usuarios
const obtenerUsuarios = catchError(async (req, res) => {
  const usuarios = await User.findAll({ attributes: { exclude: ["password"] } });
  res.json(usuarios);
});

// 🟢 Obtener un usuario por ID
const obtenerUsuario = catchError(async (req, res) => {
  const { id } = req.params;
  const usuario = await User.findByPk(id, { attributes: { exclude: ["password"] } });
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuario);
});

// 🟢 Actualizar usuario (solo nombre)
const actualizarUsuario = catchError(async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

  await usuario.update({ nombre });
  res.json(usuario);
});

// 🟢 Eliminar usuario
const eliminarUsuario = catchError(async (req, res) => {
  const { id } = req.params;
  const eliminado = await User.destroy({ where: { id } });
  if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ message: "Usuario eliminado correctamente" });
});

// 🟢 Login usuario
const loginUsuario = catchError(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email y password requeridos" });

  const usuario = await User.findOne({ where: { email } });
  if (!usuario) return res.status(401).json({ error: "Credenciales inválidas en busqueda" });

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) return res.status(401).json({ error: "Credenciales inválidas" });

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";//!aca puedo modificar cuando quiero q expire  el token
  const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn });
  const { password: _pw, ...usuarioSeguro } = usuario.toJSON();
  res.json({ token, expiresIn, usuario: usuarioSeguro });
});

// 🔹 Exportación correcta
module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
};
