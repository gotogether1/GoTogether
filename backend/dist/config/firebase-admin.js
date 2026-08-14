"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdmin = getFirebaseAdmin;
exports.getFirestoreDb = getFirestoreDb;
exports.getFirebaseAuth = getFirebaseAuth;
const admin = __importStar(require("firebase-admin"));
const env_js_1 = require("./env.js");
let firebaseAdminApp = null;
function getFirebaseAdmin() {
    if (firebaseAdminApp) {
        return firebaseAdminApp;
    }
    if (admin.apps.length > 0 && admin.apps[0]) {
        firebaseAdminApp = admin.apps[0];
        return firebaseAdminApp;
    }
    const projectId = env_js_1.env.FIREBASE_PROJECT_ID;
    const clientEmail = env_js_1.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = env_js_1.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }
    if (projectId && clientEmail && privateKey) {
        firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log('✅ Firebase Admin initialized with service account credentials');
    }
    else {
        // Fallback for development without service account JSON (reads GOOGLE_APPLICATION_CREDENTIALS if available)
        firebaseAdminApp = admin.initializeApp({
            projectId: projectId || 'gotogether-2026',
        });
        console.log('⚠️ Firebase Admin initialized with default application credentials');
    }
    return firebaseAdminApp;
}
function getFirestoreDb() {
    return getFirebaseAdmin().firestore();
}
function getFirebaseAuth() {
    return getFirebaseAdmin().auth();
}
