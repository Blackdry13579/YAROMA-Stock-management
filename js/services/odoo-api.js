/* ============================================
   YAROMA SERVICE - API ODOO
   Fichier: odoo-api.js
   Description: Communication avec l'API Odoo 17 (XML-RPC)
   ============================================ */

class OdooAPI {
    constructor() {
        this.config = window.APP_CONFIG.ODOO;
        this.uid = null;
        this.sessionId = null;
        this.context = {
            lang: 'fr_FR',
            tz: 'Africa/Ouagadougou'
        };
    }

    /**
     * Authentification Odoo
     */
    async authenticate() {
        try {
            const response = await fetch(`${this.config.URL}/web/session/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    params: {
                        db: this.config.DATABASE,
                        login: this.config.USERNAME,
                        password: this.config.PASSWORD
                    }
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.data.message || 'Erreur d\'authentification');
            }

            if (data.result && data.result.uid) {
                this.uid = data.result.uid;
                this.sessionId = data.result.session_id;
                
                // Sauvegarder en local
                localStorage.setItem(APP_CONFIG.SESSION.STORAGE_KEYS.ODOO_UID, this.uid);
                localStorage.setItem(APP_CONFIG.SESSION.STORAGE_KEYS.ODOO_SESSION, this.sessionId);

                console.log('✅ Authentification Odoo réussie - UID:', this.uid);
                return {
                    success: true,
                    uid: this.uid,
                    session_id: this.sessionId
                };
            } else {
                throw new Error('Identifiants incorrects');
            }
        } catch (error) {
            console.error('❌ Erreur authentification Odoo:', error);
            throw error;
        }
    }

    /**
     * Vérifier si authentifié
     */
    isAuthenticated() {
        return this.uid !== null || localStorage.getItem(APP_CONFIG.SESSION.STORAGE_KEYS.ODOO_UID) !== null;
    }

    /**
     * Charger la session depuis localStorage
     */
    loadSession() {
        this.uid = localStorage.getItem(APP_CONFIG.SESSION.STORAGE_KEYS.ODOO_UID);
        this.sessionId = localStorage.getItem(APP_CONFIG.SESSION.STORAGE_KEYS.ODOO_SESSION);
    }

    /**
     * Appel RPC générique
     */
    async call(model, method, args = [], kwargs = {}) {
        try {
            if (!this.uid) {
                this.loadSession();
                if (!this.uid) {
                    await this.authenticate();
                }
            }

            const response = await fetch(`${this.config.URL}/web/dataset/call_kw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        model: model,
                        method: method,
                        args: args,
                        kwargs: {
                            context: this.context,
                            ...kwargs
                        }
                    },
                    id: Math.floor(Math.random() * 1000000)
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error('Erreur RPC:', data.error);
                throw new Error(data.error.data.message || 'Erreur lors de l\'appel RPC');
            }

            return data.result;
        } catch (error) {
            console.error('❌ Erreur call RPC:', error);
            throw error;
        }
    }

    /**
     * Rechercher des enregistrements
     */
    async search(model, domain = [], limit = 80, offset = 0, order = '') {
        return await this.call(model, 'search', [domain], {
            limit: limit,
            offset: offset,
            order: order
        });
    }

    /**
     * Lire des enregistrements
     */
    async read(model, ids, fields = []) {
        return await this.call(model, 'read', [ids, fields]);
    }

    /**
     * Rechercher et lire
     */
    async searchRead(model, domain = [], fields = [], limit = 80, offset = 0, order = '') {
        return await this.call(model, 'search_read', [], {
            domain: domain,
            fields: fields,
            limit: limit,
            offset: offset,
            order: order
        });
    }

    /**
     * Créer un enregistrement
     */
    async create(model, values) {
        return await this.call(model, 'create', [values]);
    }

    /**
     * Mettre à jour un enregistrement
     */
    async write(model, ids, values) {
        return await this.call(model, 'write', [ids, values]);
    }

    /**
     * Supprimer un enregistrement
     */
    async unlink(model, ids) {
        return await this.call(model, 'unlink', [ids]);
    }

    /**
     * Compter les enregistrements
     */
    async searchCount(model, domain = []) {
        return await this.call(model, 'search_count', [domain]);
    }

    /**
     * Obtenir les champs d'un modèle
     */
    async fieldsGet(model, fields = [], attributes = []) {
        return await this.call(model, 'fields_get', [fields, attributes]);
    }
}

// Créer une instance globale
window.OdooAPI = new OdooAPI();

console.log('✅ Service Odoo API chargé');