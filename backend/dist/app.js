"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const me_routes_js_1 = __importDefault(require("./routes/me.routes.js"));
const rides_routes_js_1 = __importDefault(require("./routes/rides.routes.js"));
const bookings_routes_js_1 = __importDefault(require("./routes/bookings.routes.js"));
const reviews_routes_js_1 = __importDefault(require("./routes/reviews.routes.js"));
const reports_routes_js_1 = __importDefault(require("./routes/reports.routes.js"));
const blocks_routes_js_1 = __importDefault(require("./routes/blocks.routes.js"));
const error_handler_js_1 = require("./middleware/error-handler.js");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint (Public, Render requirement)
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Go Together API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// Mounted v1 API routes
app.use('/v1/me', me_routes_js_1.default);
app.use('/v1/rides', rides_routes_js_1.default);
app.use('/v1/bookings', bookings_routes_js_1.default);
app.use('/v1/reviews', reviews_routes_js_1.default);
app.use('/v1/reports', reports_routes_js_1.default);
app.use('/v1/blocks', blocks_routes_js_1.default);
// Error Handler Middleware
app.use(error_handler_js_1.errorHandler);
exports.default = app;
