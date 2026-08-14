"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const block_service_js_1 = require("../services/block.service.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const blockedIds = await block_service_js_1.BlockService.getBlockedUsers(uid);
        res.json({ data: blockedIds });
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const { blockedId } = req.body;
        await block_service_js_1.BlockService.blockUser(uid, blockedId);
        res.status(201).json({ data: { success: true } });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:blockedId', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        await block_service_js_1.BlockService.unblockUser(uid, req.params.blockedId);
        res.json({ data: { success: true } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
