"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const user_service_js_1 = require("../services/user.service.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const profile = await user_service_js_1.UserService.getProfile(uid);
        res.json({ data: profile });
    }
    catch (err) {
        next(err);
    }
});
router.patch('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const updated = await user_service_js_1.UserService.updateProfile(uid, req.body);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        await user_service_js_1.UserService.deleteProfile(uid);
        res.json({ data: { success: true, message: 'Account deleted successfully' } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
