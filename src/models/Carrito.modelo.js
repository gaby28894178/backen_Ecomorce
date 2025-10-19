const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");
const User = require("./User.modelo");

const Carrito = sequelize.define("Carrito", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

// 🔹 Relaciones

// Cada carrito pertenece a un usuario
Carrito.belongsTo(User, { foreignKey: "usuarioId" });

// Cada usuario puede tener un carrito (uno a uno)
User.hasOne(Carrito, { foreignKey: "usuarioId" });

module.exports = Carrito;
