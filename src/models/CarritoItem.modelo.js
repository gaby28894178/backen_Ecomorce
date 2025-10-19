const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");
const Carrito = require("./Carrito.modelo");
const Product = require("./Product.modelo");

const CarritoItem = sequelize.define("CarritoItem", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
});

// 🔹 Relaciones

// Cada item pertenece a un carrito
CarritoItem.belongsTo(Carrito, { foreignKey: "carritoId" });

// Un carrito puede tener muchos items
Carrito.hasMany(CarritoItem, { foreignKey: "carritoId" });

// Cada item pertenece a un producto
CarritoItem.belongsTo(Product, { foreignKey: "productoId" });

// Un producto puede estar en muchos items de carritos diferentes
Product.hasMany(CarritoItem, { foreignKey: "productoId" });

module.exports = CarritoItem;
