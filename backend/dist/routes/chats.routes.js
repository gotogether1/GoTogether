"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const chat_service_js_1 = require("../services/chat.service.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const conversations = await chat_service_js_1.ChatService.getConversations(uid);
        res.json({ data: conversations });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:bookingId', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const conversation = await chat_service_js_1.ChatService.getConversation(uid, req.params.bookingId);
        res.json({ data: conversation });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:bookingId/messages', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const messages = await chat_service_js_1.ChatService.getMessages(uid, req.params.bookingId);
        res.json({ data: messages });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:bookingId/messages', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const { body } = req.body;
        const message = await chat_service_js_1.ChatService.sendMessage(uid, req.params.bookingId, body);
        res.status(201).json({ data: message });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
