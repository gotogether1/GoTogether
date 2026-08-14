"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const api_error_js_1 = require("../utils/api-error.js");
function errorHandler(err, _req, res, _next) {
    if (err instanceof api_error_js_1.ApiError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }
    console.error('Unhandled Server Error:', err);
    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong. Please try again later.',
        },
    });
}
