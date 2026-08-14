"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
const api_error_js_1 = require("../utils/api-error.js");
async function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(api_error_js_1.ApiError.unauthorized('Missing or invalid Authorization header'));
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return next(api_error_js_1.ApiError.unauthorized('Bearer token is empty'));
    }
    try {
        const decodedToken = await (0, firebase_admin_js_1.getFirebaseAuth)().verifyIdToken(token);
        req.auth = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            providerIds: decodedToken.firebase?.sign_in_provider ? [decodedToken.firebase.sign_in_provider] : [],
        };
        return next();
    }
    catch (err) {
        console.warn('Firebase ID token verification failed:', err.message);
        return next(api_error_js_1.ApiError.unauthorized('Invalid or expired authentication token'));
    }
}
