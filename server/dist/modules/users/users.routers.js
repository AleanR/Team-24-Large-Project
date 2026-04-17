"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_controllers_1 = require("./users.controllers");
const middlewares_1 = require("../../middlewares");
const users_password_1 = require("./users.password");
exports.default = (router) => {
    router.get('/users/me', middlewares_1.isAuthenticated, users_controllers_1.getCurrentUser);
    router.post('/users/earn-points', middlewares_1.isAuthenticated, users_controllers_1.earnPoints);
    router.get('/users', middlewares_1.isAuthenticated, users_controllers_1.getAllUsers);
    router.delete('/users/:id', middlewares_1.isAuthenticated, users_controllers_1.deleteUser);
    router.patch('/users/:id', middlewares_1.isAuthenticated, users_controllers_1.updateUser);
    router.post('/users/forgot-password', users_password_1.forgotPass);
    router.patch('/users/reset-password/:token', users_password_1.resetPass);
    router.get('/users/search', middlewares_1.isAuthenticated, users_controllers_1.searchUsers);
    router.get('/users/leaderboard', users_controllers_1.getLeaderboard); // public: leaderboard visible without login
    router.get('/users/:id/redemptions', middlewares_1.isAuthenticated, users_controllers_1.getRedemptions);
    router.get('/users/:id/ticket-redemptions', middlewares_1.isAuthenticated, users_controllers_1.getTicketRedemptions);
    router.post('/users/support/contact', middlewares_1.isAuthenticated, users_controllers_1.contactSupport);
    router.get('/users/:id', users_controllers_1.getPublicUser); // public: view profile from leaderboard
};
//# sourceMappingURL=users.routers.js.map