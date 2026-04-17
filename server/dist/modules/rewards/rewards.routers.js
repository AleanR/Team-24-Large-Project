"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rewards_controllers_1 = require("./rewards.controllers");
const middlewares_1 = require("../../middlewares");
const users_controllers_1 = require("../users/users.controllers");
exports.default = (router) => {
    router.get('/rewards', middlewares_1.isAuthenticated, rewards_controllers_1.getRewards);
    router.post('/users/:id/redeem', middlewares_1.isAuthenticated, rewards_controllers_1.redeemReward);
    router.post('/users/:id/earn-points', middlewares_1.isAuthenticated, users_controllers_1.earnPoints);
};
//# sourceMappingURL=rewards.routers.js.map