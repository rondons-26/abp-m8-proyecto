import ProductsService from "../services/products.service.js";

export const getProducts = async (req, res, next) => {
    try {
        const products = await ProductsService.getAllProducts();
        res.status(200).json({ status: "success", data: products });

    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        // GENERA SKU ÚNICO AUTOMÁTICO (ej: SKU-95621)
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        const sku = `SKU-${randomDigits}`;

        const newProduct = await ProductsService.createProduct({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            sku,
            ...(imageUrl && { imageUrl }),
        });

        res.status(201).json({
            status: "success",
            message: "Producto creado exitosamente",
            data: newProduct,
        });

    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatedProduct = await ProductsService.updateProduct(id, {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            ...(imageUrl && { imageUrl }),
        });

        if (!updatedProduct) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.status(200).json({
            status: "success",
            message: "Producto actualizado correctamente",
            data: updatedProduct,
        });

    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await ProductsService.deleteProduct(id);

        if (!deleted) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.status(200).json({ status: "success", message: "Producto eliminado correctamente" });

    } catch (error) {
        next(error);
    }
};