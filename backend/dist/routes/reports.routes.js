"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const report_service_js_1 = require("../services/report.service.js");
const index_js_1 = require("../validators/index.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.post('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const validated = index_js_1.createReportSchema.parse(req.body);
        const report = await report_service_js_1.ReportService.createReport({ reporterId: uid, ...validated });
        res.status(201).json({ data: report });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
