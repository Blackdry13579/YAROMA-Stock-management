/**
 * Service API Odoo pour YAROMA Stock Management
 * Gestion complète des opérations CRUD avec Odoo 16
 */

class OdooAPI {
    constructor(config) {
        this.url = config.url;
        this.db = config.db;
        this.username = config.username;
        this.password = config.password;
        this.uid = null;
        this.context = {};
    }

    /**
     * Authentification à Odoo
     * @returns {Promise<boolean>}
     */
    async authenticate() {
        try {
            const response = await fetch(`${this.url}/web/session/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    params: {
                        db: this.db,
                        login: this.username,
                        password: this.password,
                    },
                }),
            });

            const data = await response.json();

            if (data.result && data.result.uid) {
                this.uid = data.result.uid;
                this.context = data.result.user_context || {};
                console.log('✅ Connexion Odoo réussie - UID:', this.uid);
                return true;
            }

            console.error('❌ Échec authentification Odoo:', data.error || 'Unknown error');
            return false;
        } catch (error) {
            console.error('❌ Erreur connexion Odoo:', error);
            return false;
        }
    }

    /**
     * Appel générique à l'API Odoo
     */
    async call(model, method, args = [], kwargs = {}) {
        if (!this.uid) {
            const auth = await this.authenticate();
            if (!auth) throw new Error('Authentication failed');
        }

        try {
            const response = await fetch(`${this.url}/web/dataset/call_kw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        model: model,
                        method: method,
                        args: args,
                        kwargs: kwargs,
                    },
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Odoo API Error:', data.error);
                throw new Error(data.error.data?.message || 'API Error');
            }

            return data.result;
        } catch (error) {
            console.error(`❌ Erreur appel API (${model}.${method}):`, error);
            throw error;
        }
    }

    // ==================== PRODUITS ====================

    /**
     * Récupérer tous les produits
     */
    async getProducts(filters = [], fields = null) {
        const defaultFields = [
            'id', 'name', 'default_code', 'list_price', 
            'qty_available', 'categ_id', 'uom_id', 'barcode',
            'type', 'sale_ok', 'purchase_ok'
        ];

        return await this.call('product.product', 'search_read', [filters], {
            fields: fields || defaultFields,
        });
    }

    /**
     * Récupérer un produit par ID
     */
    async getProduct(productId, fields = null) {
        const products = await this.getProducts([['id', '=', productId]], fields);
        return products.length > 0 ? products[0] : null;
    }

    /**
     * Créer un produit
     */
    async createProduct(productData) {
        return await this.call('product.product', 'create', [productData]);
    }

    /**
     * Mettre à jour un produit
     */
    async updateProduct(productId, productData) {
        return await this.call('product.product', 'write', [[productId], productData]);
    }

    /**
     * Supprimer un produit
     */
    async deleteProduct(productId) {
        return await this.call('product.product', 'unlink', [[productId]]);
    }

    /**
     * Rechercher des produits
     */
    async searchProducts(searchTerm, limit = 20) {
        const filters = [
            '|', '|',
            ['name', 'ilike', searchTerm],
            ['default_code', 'ilike', searchTerm],
            ['barcode', 'ilike', searchTerm]
        ];

        return await this.call('product.product', 'search_read', [filters], {
            limit: limit,
            fields: ['id', 'name', 'default_code', 'list_price', 'qty_available', 'categ_id'],
        });
    }

    // ==================== CATÉGORIES ====================

    /**
     * Récupérer toutes les catégories
     */
    async getCategories(filters = []) {
        return await this.call('product.category', 'search_read', [filters], {
            fields: ['id', 'name', 'parent_id', 'child_id', 'product_count'],
        });
    }

    /**
     * Créer une catégorie
     */
    async createCategory(categoryData) {
        return await this.call('product.category', 'create', [categoryData]);
    }

    /**
     * Mettre à jour une catégorie
     */
    async updateCategory(categoryId, categoryData) {
        return await this.call('product.category', 'write', [[categoryId], categoryData]);
    }

    /**
     * Supprimer une catégorie
     */
    async deleteCategory(categoryId) {
        return await this.call('product.category', 'unlink', [[categoryId]]);
    }

    // ==================== STOCK / INVENTAIRE ====================

    /**
     * Récupérer les mouvements de stock
     */
    async getStockMoves(filters = [], limit = 100) {
        return await this.call('stock.move', 'search_read', [filters], {
            fields: ['id', 'name', 'product_id', 'product_uom_qty', 'date', 'state', 'location_id', 'location_dest_id'],
            limit: limit,
            order: 'date desc',
        });
    }

    /**
     * Ajuster le stock d'un produit
     */
    async adjustStock(productId, newQuantity, locationId = null) {
        // Cette fonction nécessite plus de logique selon votre configuration Odoo
        // Vous devrez peut-être créer un inventaire et le valider
        console.warn('adjustStock: À implémenter selon votre configuration');
        return null;
    }

    // ==================== VENTES ====================

    /**
     * Récupérer les commandes de vente
     */
    async getSaleOrders(filters = [], limit = 100) {
        return await this.call('sale.order', 'search_read', [filters], {
            fields: ['id', 'name', 'partner_id', 'date_order', 'amount_total', 'state'],
            limit: limit,
            order: 'date_order desc',
        });
    }

    /**
     * Créer une commande de vente
     */
    async createSaleOrder(orderData) {
        return await this.call('sale.order', 'create', [orderData]);
    }

    // ==================== ACHATS ====================

    /**
     * Récupérer les commandes d'achat
     */
    async getPurchaseOrders(filters = [], limit = 100) {
        return await this.call('purchase.order', 'search_read', [filters], {
            fields: ['id', 'name', 'partner_id', 'date_order', 'amount_total', 'state'],
            limit: limit,
            order: 'date_order desc',
        });
    }

    /**
     * Créer une commande d'achat
     */
    async createPurchaseOrder(orderData) {
        return await this.call('purchase.order', 'create', [orderData]);
    }

    // ==================== CLIENTS / FOURNISSEURS ====================

    /**
     * Récupérer les partenaires (clients/fournisseurs)
     */
    async getPartners(filters = [], limit = 100) {
        return await this.call('res.partner', 'search_read', [filters], {
            fields: ['id', 'name', 'email', 'phone', 'customer_rank', 'supplier_rank'],
            limit: limit,
        });
    }

    /**
     * Récupérer uniquement les clients
     */
    async getCustomers(limit = 100) {
        return await this.getPartners([['customer_rank', '>', 0]], limit);
    }

    /**
     * Récupérer uniquement les fournisseurs
     */
    async getSuppliers(limit = 100) {
        return await this.getPartners([['supplier_rank', '>', 0]], limit);
    }

    /**
     * Créer un partenaire
     */
    async createPartner(partnerData) {
        return await this.call('res.partner', 'create', [partnerData]);
    }

    // ==================== RAPPORTS ====================

    /**
     * Statistiques générales
     */
    async getStats() {
        try {
            const [products, categories, saleOrders, purchaseOrders] = await Promise.all([
                this.getProducts([]),
                this.getCategories([]),
                this.getSaleOrders([['state', 'in', ['sale', 'done']]], 10),
                this.getPurchaseOrders([['state', 'in', ['purchase', 'done']]], 10),
            ]);

            return {
                totalProducts: products.length,
                totalCategories: categories.length,
                totalSales: saleOrders.length,
                totalPurchases: purchaseOrders.length,
                lowStock: products.filter(p => p.qty_available < 10).length,
            };
        } catch (error) {
            console.error('❌ Erreur récupération stats:', error);
            return null;
        }
    }
}

// Initialiser l'API avec la config
let odooApi;
if (typeof ODOO_CONFIG !== 'undefined') {
    odooApi = new OdooAPI(ODOO_CONFIG);
    console.log('📡 OdooAPI initialisée');
} else {
    console.error('❌ ODOO_CONFIG non trouvé. Vérifiez que config.js est chargé.');
}

// Export pour utilisation dans les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OdooAPI, odooApi };
}