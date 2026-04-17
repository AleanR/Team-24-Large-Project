"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_controllers_1 = require("./authentication.controllers");
const users_controllers_1 = require("../users/users.controllers");
const middlewares_1 = require("../../middlewares");
exports.default = (router) => {
    router.post('/users/auth/register', authentication_controllers_1.register);
    router.post('/users/auth/login', authentication_controllers_1.login);
    router.post('/users/auth/logout', authentication_controllers_1.logout);
    router.get('/users/auth/verify-email', authentication_controllers_1.verifyEmail);
    router.post('/users/auth/resend-verification', middlewares_1.isAuthenticated, authentication_controllers_1.resendVerification);
    // Backward-compatible aliases for deployed/cached clients still using /api/auth/*
    router.post('/auth/register', authentication_controllers_1.register);
    router.post('/auth/login', authentication_controllers_1.login);
    router.post('/auth/logout', authentication_controllers_1.logout);
    router.get('/auth/verify-email', authentication_controllers_1.verifyEmail);
    router.get('/auth/me', middlewares_1.isAuthenticated, users_controllers_1.getCurrentUser);
};
//# sourceMappingURL=authentication.routers.js.map