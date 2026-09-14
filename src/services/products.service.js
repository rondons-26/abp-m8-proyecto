import { Product } from "../models/index.js";

class ProductsService {
    // 1. OBTENER TODOS LOS PRODUCTOS
    static async getAllProducts() {
        return await Product.findAll({
            attributes: { exclude: ["createdAt", "updatedAt"] }
        });
    }

    // 2. OBTENER PRODUCTO POR ID
    static async getProductById(id) {
        return await Product.findByPk(id);
    }

    // 3. CREAR PRODUCTO
    static async createProduct(data) {
        return await Product.create(data);
    }

    // 4. ACTUALIZAR PRODUCTO
    static async updateProduct(id, data) {
        const product = await Product.findByPk(id);
        if (!product) return null;
        return await product.update(data);
    }

    // 5. ELIMINAR PRODUCTO
    static async deleteProduct(id) {
        const product = await Product.findByPk(id);
        if (!product) return null;
        await product.destroy();
        return true;
    }
}

export default ProductsService;