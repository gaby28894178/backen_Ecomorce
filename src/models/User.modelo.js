// const db = require("../utils/connection");
// const bcrypt = require("bcrypt");

// class UserModel {
//   static tableName = "Users";

//   // Crear tabla si no existe
//   static async init() {
//     const query = `
//       CREATE TABLE IF NOT EXISTS ${this.tableName} (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(100) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('admin','user') NOT NULL DEFAULT 'user',
//         estado BOOLEAN NOT NULL DEFAULT true
//       );
//     `;
//     await db.query(query);
//   }

//   static async create({ name, email, password, role = "user", estado = true }) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const query = `INSERT INTO ${this.tableName} (name, email, password, role, estado) VALUES (?, ?, ?, ?, ?)`;
//     const [result] = await db.query(query, [name, email, hashedPassword, role, estado]);
//     return { id: result.insertId, name, email, role, estado };
//   }

//   static async getAll() {
//     const [rows] = await db.query(`SELECT id, name, email, role, estado FROM ${this.tableName}`);
//     return rows;
//   }

//   static async getOne(id) {
//     const [rows] = await db.query(`SELECT id, name, email, role, estado FROM ${this.tableName} WHERE id = ?`, [id]);
//     return rows[0];
//   }

//   static async update(id, { name, role, estado }) {
//     const query = `
//       UPDATE ${this.tableName}
//       SET name = COALESCE(?, name),
//           role = COALESCE(?, role),
//           estado = COALESCE(?, estado)
//       WHERE id = ?
//     `;
//     await db.query(query, [name, role, estado, id]);
//     return this.getOne(id);
//   }

//   static async delete(id) {
//     await db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
//     return { id };
//   }
// }

// module.exports = UserModel;





const { DataTypes } = require("sequelize");
const sequelize = require("../utils/connection");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user"
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
        productos_comprados: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: []
    }

});

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;
