/* ============================================
   YAROMA SERVICE - PRODUITS
   Fichier: products.js
   Description: Gestion des produits via Odoo
   ============================================ */

class ProductsService {
    constructor() {
        this.model = 'product.product';
        this.templateModel = 'product.template';
    }

    /**
     * Récupérer tous les produits
     */
    async getAll(limit = 80, offset = 0, search = '') {
        try {
            let domain = [['sale_ok', '=', true]]; // Produits vendables uniquement

            if (search) {
                domain.push('|', ['name', 'ilike', search], ['default_code', 'ilike', search]);
            }

            const products = await window.OdooAPI.searchRead(
                this.model,
                domain,
                [
                    'id',
                    'name',
                    'default_code',
                    'list_price',
                    'standard_price',
                    'qty_available',
                    'virtual_available',
                    'categ_id',
                    'uom_id',
                    'product_tmpl_id',
                    'image_128',
                    'active',
                    'type'
                ],
                limit,
                offset,
                'name ASC'
            );

            return products;
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            throw error;
        }
    }

    /**
     * Récupérer un produit par ID
     */
    async getById(id) {
        try {
            const product = await window.OdooAPI.read(
                this.model,
                [id],
                [
                    'id',
                    'name',
                    'default_code',
                    'description',
                    'description_sale',
                    'list_price',
                    'standard_price',
                    'qty_available',
                    'virtual_available',
                    'categ_id',
                    'uom_id',
                    'uom_po_id',
                    'product_tmpl_id',
                    'product_variant_ids',
                    'attribute_line_ids',
                    'image_1920',
                    'active',
                    'type',
                    'weight',
                    'volume'
                ]
            );

            return product[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
            throw error;
        }
    }

    /**
     * Récupérer les catégories de produits
     */
    async getCategories() {
        try {
            const categories = await window.OdooAPI.searchRead(
                'product.category',
                [],
                ['id', 'name', 'parent_id', 'product_count'],
                100,
                0,
                'name ASC'
            );

            return categories;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    }

    /**
     * Récupérer les produits par catégorie
     */
    async getByCategory(categoryId, limit = 80) {
        try {
            const products = await window.OdooAPI.searchRead(
                this.model,
                [['categ_id', '=', categoryId], ['sale_ok', '=', true]],
                [
                    'id',
                    'name',
                    'default_code',
                    'list_price',
                    'standard_price',
                    'qty_available',
                    'categ_id',
                    'uom_id',
                    'image_128'
                ],
                limit,
                0,
                'name ASC'
            );

            return products;
        } catch (error) {
            console.error('Erreur lors de la récupération des produits par catégorie:', error);
            throw error;
        }
    }

    /**
     * Récupérer les variantes d'un produit
     */
    async getVariants(productTemplateId) {
        try {
            const variants = await window.OdooAPI.searchRead(
                this.model,
                [['product_tmpl_id', '=', productTemplateId]],
                [
                    'id',
                    'name',
                    'default_code',
                    'list_price',
                    'standard_price',
                    'qty_available',
                    'product_template_attribute_value_ids',
                    'image_128'
                ],
                100,
                0,
                'name ASC'
            );

            return variants;
        } catch (error) {
            console.error('Erreur lors de la récupération des variantes:', error);
            throw error;
        }
    }

    /**
     * Récupérer les produits avec stock faible
     */
    async getLowStock(threshold = 10) {
        try {
            const products = await window.OdooAPI.searchRead(
                this.model,
                [
                    ['qty_available', '<=', threshold],
                    ['qty_available', '>', 0],
                    ['type', '=', 'product'],
                    ['sale_ok', '=', true]
                ],
                [
                    'id',
                    'name',
                    'default_code',
                    'qty_available',
                    'categ_id',
                    'list_price'
                ],
                50,
                0,
                'qty_available ASC'
            );

            return products;
        } catch (error) {
            console.error('Erreur lors de la récupération des produits en stock faible:', error);
            throw error;
        }
    }

    /**
     * Récupérer les produits en rupture de stock
     */
    async getOutOfStock() {
        try {
            const products = await window.OdooAPI.searchRead(
                this.model,
                [
                    ['qty_available', '<=', 0],
                    ['type', '=', 'product'],
                    ['sale_ok', '=', true]
                ],
                [
                    'id',
                    'name',
                    'default_code',
                    'qty_available',
                    'categ_id',
                    'list_price'
                ],
                50,
                0,
                'name ASC'
            );

            return products;
        } catch (error) {
            console.error('Erreur lors de la récupération des produits en rupture:', error);
            throw error;
        }
    }

    /**
     * Créer un nouveau produit
     */
    async create(productData) {
        try {
            const productId = await window.OdooAPI.create(this.templateModel, {
                name: productData.name,
                default_code: productData.code || false,
                list_price: productData.salePrice || 0,
                standard_price: productData.costPrice || 0,
                categ_id: productData.categoryId || false,
                type: productData.type || 'product',
                description: productData.description || false,
                sale_ok: true,
                purchase_ok: true
            });

            console.log('✅ Produit créé avec succès - ID:', productId);
            return productId;
        } catch (error) {
            console.error('Erreur lors de la création du produit:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un produit
     */
    async update(productId, productData) {
        try {
            const updateData = {};

            if (productData.name) updateData.name = productData.name;
            if (productData.code !== undefined) updateData.default_code = productData.code;
            if (productData.salePrice !== undefined) updateData.list_price = productData.salePrice;
            if (productData.costPrice !== undefined) updateData.standard_price = productData.costPrice;
            if (productData.categoryId) updateData.categ_id = productData.categoryId;
            if (productData.description !== undefined) updateData.description = productData.description;

            await window.OdooAPI.write(this.model, [productId], updateData);

            console.log('✅ Produit mis à jour - ID:', productId);
            return true;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
            throw error;
        }
    }

    /**
     * Supprimer un produit (archiver)
     */
    async delete(productId) {
        try {
            await window.OdooAPI.write(this.model, [productId], { active: false });
            console.log('✅ Produit archivé - ID:', productId);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'archivage du produit:', error);
            throw error;
        }
    }

    /**
     * Obtenir les statistiques des produits
     */
    async getStats() {
        try {
            const totalProducts = await window.OdooAPI.searchCount(
                this.model,
                [['sale_ok', '=', true], ['active', '=', true]]
            );

            const lowStockCount = await window.OdooAPI.searchCount(
                this.model,
                [
                    ['qty_available', '<=', APP_CONFIG.ALERTS.LOW_STOCK_THRESHOLD],
                    ['qty_available', '>', 0],
                    ['type', '=', 'product']
                ]
            );

            const outOfStockCount = await window.OdooAPI.searchCount(
                this.model,
                [
                    ['qty_available', '<=', 0],
                    ['type', '=', 'product']
                ]
            );

            return {
                total: totalProducts,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
}

// Créer une instance globale
window.ProductsService = new ProductsService();

console.log('✅ Service Produits chargé');