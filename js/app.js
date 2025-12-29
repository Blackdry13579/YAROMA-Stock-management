/* ============================================
   YAROMA SERVICE - APPLICATION VUE.JS
   Fichier: app.js
   Description: Point d'entrée principal de l'application Vue.js
   ============================================ */
/**
 * Application principale YAROMA Stock Management
 */

// Test de connexion Odoo au démarrage
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Démarrage YAROMA Stock Management');
    
    // Tester la connexion Odoo
    if (typeof odooApi !== 'undefined') {
        try {
            const isConnected = await odooApi.authenticate();
            
            if (isConnected) {
                console.log('✅ Connexion Odoo réussie');
                
                // Charger les stats
                const stats = await odooApi.getStats();
                console.log('📊 Statistiques:', stats);
                
                // Vous pouvez maintenant utiliser odooApi partout dans votre app
            } else {
                console.error('❌ Échec connexion Odoo');
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    } else {
        console.error('❌ odooApi non disponible');
    }
    
    // Le reste de votre code app.js...
});
// Configuration globale de Vue.js
const { createApp } = Vue;

// Store global (état partagé de l'application)
const store = {
    state: {
        user: null,
        isAuthenticated: false,
        products: [],
        categories: [],
        sales: [],
        purchases: [],
        inventory: [],
    },
    
    // Mutations pour modifier l'état
    setUser(user) {
        this.state.user = user;
        this.state.isAuthenticated = !!user;
    },
    
    setProducts(products) {
        this.state.products = products;
    },
    
    setCategories(categories) {
        this.state.categories = categories;
    },
    
    setSales(sales) {
        this.state.sales = sales;
    },
    
    setPurchases(purchases) {
        this.state.purchases = purchases;
    },
    
    setInventory(inventory) {
        this.state.inventory = inventory;
    },
    
    // Getters pour récupérer des données calculées
    getProductById(id) {
        return this.state.products.find(p => p.id === id);
    },
    
    getCategoryById(id) {
        return this.state.categories.find(c => c.id === id);
    },
    
    getLowStockProducts() {
        return this.state.inventory.filter(item => item.stock > 0 && item.stock <= 10);
    },
    
    getOutOfStockProducts() {
        return this.state.inventory.filter(item => item.stock === 0);
    }
};

// Mixin global pour toutes les pages
const globalMixin = {
    data() {
        return {
            store: store.state,
            loading: false,
            error: null
        };
    },
    
    methods: {
        // Formater un prix
        formatPrice(price) {
            return new Intl.NumberFormat('fr-FR').format(price) + ' XOF';
        },
        
        // Formater une date
        formatDate(date) {
            return new Date(date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        
        // Formater une date avec heure
        formatDateTime(date) {
            return new Date(date).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Afficher un message de succès
        showSuccess(message) {
            alert('✅ ' + message);
        },
        
        // Afficher un message d'erreur
        showError(message) {
            alert('❌ ' + message);
        },
        
        // Confirmer une action
        confirm(message) {
            return window.confirm(message);
        },
        
        // Naviguer vers une autre page
        navigate(url) {
            window.location.href = url;
        },
        
        // Déconnexion
        logout() {
            if (this.confirm('Voulez-vous vraiment vous déconnecter ?')) {
                window.AuthService.logout();
            }
        }
    },
    
    computed: {
        currentUser() {
            return this.store.user;
        },
        
        isAuthenticated() {
            return this.store.isAuthenticated;
        }
    },
    
    mounted() {
        // Vérifier l'authentification au chargement
        this.checkAuth();
    },
    
    methods: {
        checkAuth() {
            if (window.AuthService && window.AuthService.isAuthenticated()) {
                const user = window.AuthService.getCurrentUser();
                store.setUser(user);
            }
        }
    }
};

// Fonction pour initialiser Vue sur une page
window.initVueApp = function(componentConfig) {
    const app = createApp({
        mixins: [globalMixin],
        ...componentConfig
    });
    
    // Enregistrer des composants globaux si nécessaire
    
    return app.mount('#app');
};

// Utilitaires globaux
window.YaromaApp = {
    store,
    formatPrice: (price) => new Intl.NumberFormat('fr-FR').format(price) + ' XOF',
    formatDate: (date) => new Date(date).toLocaleDateString('fr-FR'),
    formatDateTime: (date) => new Date(date).toLocaleString('fr-FR')
};

console.log('✅ Vue.js Application chargée');