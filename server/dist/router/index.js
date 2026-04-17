"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_routers_1 = __importDefault(require("../modules/authentication/authentication.routers"));
const users_routers_1 = __importDefault(require("../modules/users/users.routers"));
const games_routers_1 = __importDefault(require("../modules/games/games.routers"));
const rewards_routers_1 = __importDefault(require("../modules/rewards/rewards.routers"));
const bets_routers_1 = __importDefault(require("../modules/bets/bets.routers"));
const router = (0, express_1.Router)();
exports.default = () => {
    (0, authentication_routers_1.default)(router);
    (0, users_routers_1.default)(router);
    (0, games_routers_1.default)(router);
    (0, rewards_routers_1.default)(router);
    (0, bets_routers_1.default)(router);
    return router;
};
//# sourceMappingURL=index.js.map