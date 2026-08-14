"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const notification_service_js_1 = require("../services/notification.service.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const notifications = await notification_service_js_1.NotificationService.getNotifications(uid);
        res.json({ data: notifications });
    }
    catch (err) {
        next(err);
    }
});
router.get('/unread-count', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const count = await notification_service_js_1.NotificationService.getUnreadCount(uid);
        res.json({ data: { unreadCount: count } });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:notificationId/read', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        await notification_service_js_1.NotificationService.markRead(uid, req.params.notificationId);
        res.json({ data: { success: true } });
    }
    catch (err) {
        next(err);
    }
});
router.post('/read-all', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        await notification_service_js_1.NotificationService.markAllRead(uid);
        res.json({ data: { success: true } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
