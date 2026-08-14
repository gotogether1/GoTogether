"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_js_1 = require("../middleware/authenticate.js");
const review_service_js_1 = require("../services/review.service.js");
const index_js_1 = require("../validators/index.js");
const router = (0, express_1.Router)();
router.use(authenticate_js_1.authenticate);
router.post('/', async (req, res, next) => {
    try {
        const uid = req.auth.uid;
        const { bookingId, recipientId, rating, text } = index_js_1.createReviewSchema.parse(req.body);
        const review = await review_service_js_1.ReviewService.createReview(uid, bookingId, recipientId, rating, text);
        res.status(201).json({ data: review });
    }
    catch (err) {
        next(err);
    }
});
router.get('/user/:uid', async (req, res, next) => {
    try {
        const reviews = await review_service_js_1.ReviewService.getUserReviews(req.params.uid);
        res.json({ data: reviews });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
