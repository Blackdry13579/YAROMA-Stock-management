/* ============================================
   YAROMA SERVICE - CONFIGURATION
   Fichier: config.js
   Description: Configuration de l'application (Odoo, API, etc.)
   ============================================ */

const APP_CONFIG = {
    // Configuration Odoo
    ODOO: {
        URL: 'http://16.170.231.94:8069',
        DATABASE: 'odoo_server',
        USERNAME: 'nombreange3@gmail.com',
        PASSWORD: 'Odoo_password_226',
        API_KEY: null, // Optionnel pour API REST
    },

    // Mode de fonctionnement
    MODE: 'TEST', // 'TEST' ou 'ODOO'

    // Configuration de l'application
    APP: {
        NAME: 'YAROMA Service',
        VERSION: '1.0.0',
        DESCRIPTION: 'Système de Gestion de Stock',
        LOCALE: 'fr-FR',
        CURRENCY: 'XOF', // Franc CFA
        TIMEZONE: 'Africa/Ouagadougou'
    },

    // Configuration de session
    SESSION: {
        DURATION: 30 * 24 * 60 * 60 * 1000, // 30 jours
        STORAGE_KEYS: {
            USER: 'yaroma_user',
            TOKEN: 'yaroma_token',
            REMEMBER: 'yaroma_remember',
            SESSION_EXPIRY: 'yaroma_session_expiry',
            ODOO_UID: 'yaroma_odoo_uid',
            ODOO_SESSION: 'yaroma_odoo_session'
        }
    },

    // Configuration pagination
    PAGINATION: {
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // Statuts
    STATUS: {
        PRODUCT: {
            ACTIVE: 'Actif',
            INACTIVE: 'Inactif',
            ARCHIVED: 'Archivé'
        },
        STOCK: {
            IN_STOCK: 'En stock',
            LOW_STOCK: 'Stock faible',
            OUT_OF_STOCK: 'Rupture de stock'
        },
        ORDER: {
            DRAFT: 'Brouillon',
            CONFIRMED: 'Confirmé',
            DONE: 'Terminé',
            CANCELLED: 'Annulé'
        }
    },

    // Seuils d'alerte
    ALERTS: {
        LOW_STOCK_THRESHOLD: 10,
        CRITICAL_STOCK_THRESHOLD: 5
    }
};

// Rendre la config disponible globalement
window.APP_CONFIG = APP_CONFIG;

console.log('✅ Configuration chargée');
console.log('🔗 Mode:', APP_CONFIG.MODE);
console.log('🌐 Odoo URL:', APP_CONFIG.ODOO.URL);