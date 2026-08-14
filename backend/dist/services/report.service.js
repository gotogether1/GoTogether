"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const firebase_admin_js_1 = require("../config/firebase-admin.js");
class ReportService {
    static collection = 'reports';
    static async createReport(dto) {
        const db = (0, firebase_admin_js_1.getFirestoreDb)();
        const docRef = db.collection(this.collection).doc();
        const data = {
            id: docRef.id,
            ...dto,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        await docRef.set(data);
        return data;
    }
}
exports.ReportService = ReportService;
