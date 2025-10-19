const Carrito = require("../models/Carrito.modelo");
const CarritoItem = require("../models/CarritoItem.modelo");
const Product = require("../models/Product.modelo");
const User = require("../models/User.modelo");
const sequelize = require("../utils/connection");



// Obtener carrito de un usuario con items y productos (incluye total)
async function obtenerCarritoUsuario(req, res) {
    try {
        const usuarioIdParam = Number.parseInt(req.params.usuarioId, 10);
        if (!Number.isInteger(usuarioIdParam) || usuarioIdParam < 1) return res.status(400).json({ error: "usuarioId inválido" });

        // Seguridad: un usuario solo accede a su propio carrito (admin puede ver cualquiera)
        if (req.user && req.user.role !== 'admin' && req.user.id !== usuarioIdParam) {
            return res.status(403).json({ error: "Acceso denegado" });
        }

        const carrito = await Carrito.findOne({
            where: { usuarioId: usuarioIdParam },
            include: [{
                model: CarritoItem,
                include: [{ model: Product }]
            }]
        });
        if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });

        const items = (carrito.CarritoItems || []).map(item => {
            const precio = parseFloat(item.Product?.precio ?? 0);
            const cantidad = item.cantidad;
            const subtotal = +(precio * cantidad).toFixed(2);
            return {
                id: item.id,
                productoId: item.productoId,
                nombre: item.Product?.nombre,
                precio,
                cantidad,
                subtotal
            };
        });
        const total = +(items.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2));

        res.json({
            carritoId: carrito.id,
            usuarioId: carrito.usuarioId,
            items,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Agregar producto al carrito (usuario autenticado)
async function agregarProducto(req, res) {
    try {
        const usuarioId = req.user?.id;
        const { productoId, cantidad } = req.body;
        if (!usuarioId) return res.status(401).json({ error: "No autenticado" });
        const cantidadNum = Number.parseInt(cantidad, 10);
        if (!productoId || !Number.isInteger(cantidadNum) || cantidadNum < 1) {
            return res.status(400).json({ error: "productoId y cantidad (entero >=1) requeridos" });
        }

        const carrito = await Carrito.findOne({ where: { usuarioId } });
        if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });

        let item = await CarritoItem.findOne({
            where: { carritoId: carrito.id, productoId }
        });

        if (item) {
            item.cantidad += cantidadNum;
            await item.save();
        } else {
            item = await CarritoItem.create({
                carritoId: carrito.id,
                productoId,
                cantidad: cantidadNum
            });
        }

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Eliminar un producto del carrito
async function eliminarProducto(req, res) {
    try {
        const { carritoItemId } = req.params;
        const item = await CarritoItem.findByPk(carritoItemId, { include: [{ model: Carrito }] });
        if (!item) return res.status(404).json({ error: "Item no encontrado" });

        // Seguridad: validar que el item pertenece al carrito del usuario autenticado (o admin)
        if (req.user && req.user.role !== 'admin') {
            if (!item.Carrito || item.Carrito.usuarioId !== req.user.id) {
                return res.status(403).json({ error: "Acceso denegado" });
            }
        }

        await item.destroy();
        res.json({ mensaje: "Producto eliminado del carrito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Crear carrito para un usuario (si no existe) usando identidad del token
async function crearCarritoUsuario(req, res) {
    try {
        const usuarioId = (req.user?.role === 'admin' && req.body.usuarioId) ? req.body.usuarioId : req.user?.id;
        if (!usuarioId) return res.status(400).json({ error: "usuarioId requerido" });
        let carrito = await Carrito.findOne({ where: { usuarioId } });
        if (!carrito) {
            carrito = await Carrito.create({ usuarioId });
        }
        res.status(201).json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Nuevo: obtener solo el total del carrito del usuario
async function obtenerTotalCarritoUsuario(req, res) {
    try {
        const usuarioIdParam = Number.parseInt(req.params.usuarioId, 10);
        if (!Number.isInteger(usuarioIdParam) || usuarioIdParam < 1) return res.status(400).json({ error: "usuarioId inválido" });

        // Seguridad: un usuario solo accede a su propio carrito (admin puede ver cualquiera)
        if (req.user && req.user.role !== 'admin' && req.user.id !== usuarioIdParam) {
            return res.status(403).json({ error: "Acceso denegado" });
        }

        const carrito = await Carrito.findOne({
            where: { usuarioId: usuarioIdParam },
            include: [{
                model: CarritoItem,
                include: [{ model: Product }]
            }]
        });
        if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });

        // Calcular el total
        const total = carrito.CarritoItems.reduce((sum, item) => {
            const precioUnitario = item.Product?.precio || 0;
            return sum + (precioUnitario * item.cantidad);
        }, 0);

        res.json({ total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Comprar (checkout) del carrito del usuario autenticado
async function comprarCarritoUsuario(req, res) {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) return res.status(401).json({ error: "No autenticado" });

        const carrito = await Carrito.findOne({
            where: { usuarioId },
            include: [{
                model: CarritoItem,
                include: [{ model: Product }]
            }]
        });
        if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });
        const items = carrito.CarritoItems || [];
        if (items.length === 0) return res.status(400).json({ error: "Carrito vacío" });

        let total = 0;
        const detalles = [];

        await sequelize.transaction(async (t) => {
            const usuario = await User.findByPk(usuarioId, { transaction: t });
            if (!usuario) throw new Error("Usuario no encontrado");

            for (const item of items) {
                const product = item.Product;
                if (!product) throw new Error("Producto no encontrado en item");
                const cantidad = item.cantidad;
                const precio = parseFloat(product.precio ?? 0);

                // Stock check
                if (product.stock < cantidad) {
                    const err = new Error("Stock insuficiente");
                    err.status = 400;
                    err.code = "STOCK_INSUFICIENTE";
                    err.productoId = product.id;
                    throw err;
                }

                product.stock = product.stock - cantidad;
                await product.save({ transaction: t });

                total += +(precio * cantidad).toFixed(2);
                detalles.push({ productoId: product.id, nombre: product.nombre, cantidad, precio, subtotal: +(precio * cantidad).toFixed(2) });

                const prev = Array.isArray(usuario.productos_comprados) ? usuario.productos_comprados : [];
                const addIds = Array(cantidad).fill(product.id);
                usuario.productos_comprados = prev.concat(addIds);
            }

            await usuario.save({ transaction: t });
            await CarritoItem.destroy({ where: { carritoId: carrito.id }, transaction: t });
        });

        res.json({ mensaje: "Compra realizada", total: +total.toFixed(2), detalles });
    } catch (error) {
        const status = error.status || 500;
        const message = error.code === "STOCK_INSUFICIENTE" ? `Stock insuficiente para producto ${error.productoId}` : error.message;
        res.status(status).json({ error: message });
    }
}

module.exports = {
    obtenerCarritoUsuario,
    agregarProducto,
    eliminarProducto,
    crearCarritoUsuario,
    obtenerTotalCarritoUsuario,
    comprarCarritoUsuario
};
