const Product = require("../models/Product.modelo");
const Joi = require("joi");

const productSchema = Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    descripcion: Joi.string().allow(""),
    precio: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).required(),
});

// Crear producto
async function crearProducto(req, res) {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        const { nombre, descripcion, precio, stock } = value;
        const nuevoProducto = await Product.create({ nombre, descripcion, precio, stock });
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Obtener todos los productos
async function obtenerProductos(req, res) {
    try {
        const productos = await Product.findAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Obtener producto por ID
async function obtenerProducto(req, res) {
    try {
        const producto = await Product.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto
};
