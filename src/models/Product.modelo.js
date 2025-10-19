const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING },
    url_imagen: { type: DataTypes.STRING },
    precio: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
});

module.exports = Product;
