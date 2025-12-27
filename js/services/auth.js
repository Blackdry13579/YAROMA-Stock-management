/* ============================================
   YAROMA SERVICE - SERVICE D'AUTHENTIFICATION
   Fichier: auth.js
   Description: Gestion de l'authentification (Mode Test + Mode Odoo)
   ============================================ */

// Configuration
const AUTH_CONFIG = {
    MODE: 'TEST', // 'TEST' ou 'ODOO'
    SESSION_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 jours en millisecondes
    STORAGE_KEYS: {
        USER: 'yaroma_user',
        TOKEN: 'yaroma_token',
        REMEMBER: 'yaroma_remember',
        SESSION_EXPIRY: 'yaroma_session_expiry'
    }
};

// Comptes de test (MODE TEST uniquement)
const TEST_ACCOUNTS = [
    {
        id: 1,
        email: 'admin@yaroma.com',
        password: 'admin123',
        fullname: 'Administrateur YAROMA',
        role: 'admin',
        avatar: null
    },
    {
        id: 2,
        email: 'user@yaroma.com',
        password: 'user123',
        fullname: 'Utilisateur Test',
        role: 'user',
        avatar: null
    },
    {
        id: 3,
        email: 'test@test.com',
        password: 'test123',
        fullname: 'Compte Test',
        role: 'user',
        avatar: null
    }
];

// ============================================
// FONCTIONS D'AUTHENTIFICATION
// ============================================

/**
 * Connexion utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @param {boolean} remember - Se souvenir de moi
 * @returns {Promise<Object>} - Résultat de la connexion
 */
async function login(email, password, remember = false) {
    try {
        // Vérifier le mode (priorité à APP_CONFIG si disponible)
        const mode = window.APP_CONFIG ? window.APP_CONFIG.MODE : AUTH_CONFIG.MODE;
        
        if (mode === 'TEST') {
            return await loginTest(email, password, remember);
        } else {
            return await loginOdoo(email, password, remember);
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
}

/**
 * Connexion en mode TEST
 */
async function loginTest(email, password, remember) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Chercher l'utilisateur
    const user = TEST_ACCOUNTS.find(u => u.email === email && u.password === password);

    if (!user) {
        return {
            success: false,
            message: 'Email ou mot de passe incorrect'
        };
    }

    // Générer un token fictif
    const token = generateToken();

    // Sauvegarder la session
    saveSession(user, token, remember);

    return {
        success: true,
        message: 'Connexion réussie',
        user: {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            avatar: user.avatar
        },
        token: token
    };
}

/**
 * Connexion en mode ODOO (à implémenter plus tard)
 */
async function loginOdoo(email, password, remember) {
    try {
        // Authentifier avec Odoo
        const result = await window.OdooAPI.authenticate();
        
        if (!result.success) {
            return {
                success: false,
                message: 'Identifiants incorrects'
            };
        }

        // Récupérer les infos de l'utilisateur depuis Odoo
        const userInfo = await window.OdooAPI.call('res.users', 'read', [[result.uid]], {
            fields: ['id', 'name', 'login', 'email']
        });

        const user = userInfo[0];

        // Sauvegarder la session
        saveSession({
            id: user.id,
            email: user.email || user.login,
            fullname: user.name,
            role: 'user',
            avatar: null
        }, result.session_id, remember);

        return {
            success: true,
            message: 'Connexion réussie',
            user: {
                id: user.id,
                email: user.email || user.login,
                fullname: user.name,
                role: 'user',
                avatar: null
            },
            token: result.session_id
        };
    } catch (error) {
        console.error('Erreur connexion Odoo:', error);
        return {
            success: false,
            message: error.message || 'Erreur de connexion'
        };
    }
}

/**
 * Inscription utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<Object>} - Résultat de l'inscription
 */
async function signup(userData) {
    try {
        // Vérifier le mode
        const mode = window.APP_CONFIG ? window.APP_CONFIG.MODE : AUTH_CONFIG.MODE;
        
        if (mode === 'TEST') {
            return await signupTest(userData);
        } else {
            return await signupOdoo(userData);
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        throw error;
    }
}

/**
 * Inscription en mode TEST
 */
async function signupTest(userData) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier si l'email existe déjà
    const existingUser = TEST_ACCOUNTS.find(u => u.email === userData.email);

    if (existingUser) {
        return {
            success: false,
            message: 'Cet email est déjà utilisé'
        };
    }

    // Créer un nouvel utilisateur
    const newUser = {
        id: TEST_ACCOUNTS.length + 1,
        email: userData.email,
        password: userData.password,
        fullname: userData.fullname,
        role: 'user',
        avatar: null
    };

    // Ajouter à la liste (en mémoire uniquement en mode TEST)
    TEST_ACCOUNTS.push(newUser);

    // Générer un token
    const token = generateToken();

    // Sauvegarder la session
    saveSession(newUser, token, false);

    return {
        success: true,
        message: 'Inscription réussie',
        user: {
            id: newUser.id,
            email: newUser.email,
            fullname: newUser.fullname,
            role: newUser.role,
            avatar: newUser.avatar
        },
        token: token
    };
}

/**
 * Inscription en mode ODOO (à implémenter plus tard)
 */
async function signupOdoo(userData) {
    // TODO: Implémenter l'inscription avec l'API Odoo
    throw new Error('Mode Odoo pas encore implémenté');
}

/**
 * Déconnexion
 */
function logout() {
    // Supprimer toutes les données de session
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REMEMBER);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_EXPIRY);
    
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);

    // Rediriger vers la page de connexion
    window.location.href = '/pages/auth/login.html';
}

/**
 * Vérifier si l'utilisateur est connecté
 * @returns {boolean}
 */
function isAuthenticated() {
    const user = getCurrentUser();
    const token = getToken();

    if (!user || !token) {
        return false;
    }

    // Vérifier l'expiration de la session
    const expiry = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_EXPIRY);
    if (expiry) {
        const expiryDate = new Date(parseInt(expiry));
        if (new Date() > expiryDate) {
            logout();
            return false;
        }
    }

    return true;
}

/**
 * Obtenir l'utilisateur actuellement connecté
 * @returns {Object|null}
 */
function getCurrentUser() {
    // Chercher d'abord dans localStorage (remember me)
    let userStr = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    
    // Sinon dans sessionStorage
    if (!userStr) {
        userStr = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    }

    if (!userStr) {
        return null;
    }

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Erreur lors de la lecture de l\'utilisateur:', error);
        return null;
    }
}

/**
 * Obtenir le token d'authentification
 * @returns {string|null}
 */
function getToken() {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN) || 
           sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
}

/**
 * Sauvegarder la session
 */
function saveSession(user, token, remember) {
    const userData = {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar
    };

    if (remember) {
        // Sauvegarder dans localStorage (persistant)
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REMEMBER, 'true');
        
        // Définir la date d'expiration
        const expiryDate = new Date().getTime() + AUTH_CONFIG.SESSION_DURATION;
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_EXPIRY, expiryDate.toString());
    } else {
        // Sauvegarder dans sessionStorage (temporaire)
        sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, token);
    }
}

/**
 * Générer un token aléatoire
 * @returns {string}
 */
function generateToken() {
    return 'tok_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

/**
 * Vérifier et rediriger si non authentifié
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

/**
 * Mettre à jour les informations de l'utilisateur
 * @param {Object} userData - Nouvelles données
 */
function updateUserData(userData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...userData };
    
    const isRemembered = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REMEMBER) === 'true';
    
    if (isRemembered) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } else {
        sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
}

// ============================================
// EXPORT DES FONCTIONS
// ============================================

// Rendre les fonctions disponibles globalement
window.AuthService = {
    login,
    signup,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    requireAuth,
    updateUserData,
    AUTH_CONFIG,
    TEST_ACCOUNTS // Exposer les comptes de test en mode développement
};

console.log('✅ Service d\'authentification chargé');
console.log('📋 Comptes de test disponibles:', TEST_ACCOUNTS.map(u => ({ email: u.email, password: u.password })));