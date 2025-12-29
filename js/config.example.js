/* ============================================
   YAROMA SERVICE - CONFIGURATION EXEMPLE
   Fichier: config.example.js
   Description: Exemple de configuration (à copier en config.js)
   ⚠️ NE PAS MODIFIER CE FICHIER
   ⚠️ Copiez-le en config.js et remplissez vos infos
   ============================================ */

const APP_CONFIG = {
    // Configuration Odoo
    ODOO: {
        URL: 'http://VOTRE_IP:8069',
        DATABASE: 'NOM_DE_VOTRE_BASE',
        USERNAME: 'VOTRE_USERNAME',
        PASSWORD: 'VOTRE_MOT_DE_PASSE',
        API_KEY: null,
    },

    MODE: 'ODOO',

    APP: {
        NAME: 'YAROMA Service',
        VERSION: '1.0.0',
        DESCRIPTION: 'Système de Gestion de Stock',
        LOCALE: 'fr-FR',
        CURRENCY: 'XOF',
        TIMEZONE: 'Africa/Ouagadougou'
    },

    SESSION: {
        DURATION: 30 * 24 * 60 * 60 * 1000,
        STORAGE_KEYS: {
            USER: 'yaroma_user',
            TOKEN: 'yaroma_token',
            REMEMBER: 'yaroma_remember',
            SESSION_EXPIRY: 'yaroma_session_expiry',
            ODOO_UID: 'yaroma_odoo_uid',
            ODOO_SESSION: 'yaroma_odoo_session'
        }
    },

    PAGINATION: {
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

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

    ALERTS: {
        LOW_STOCK_THRESHOLD: 10,
        CRITICAL_STOCK_THRESHOLD: 5
    }
};

const ODOO_CONFIG = {
    url: APP_CONFIG.ODOO.URL,
    db: APP_CONFIG.ODOO.DATABASE,
    username: APP_CONFIG.ODOO.USERNAME,
    password: APP_CONFIG.ODOO.PASSWORD
};

window.APP_CONFIG = APP_CONFIG;
window.ODOO_CONFIG = ODOO_CONFIG;