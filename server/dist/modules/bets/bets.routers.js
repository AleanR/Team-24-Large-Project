"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bets_controllers_1 = require("./bets.controllers");
const middlewares_1 = require("../../middlewares");
exports.default = (router) => {
    router.get('/bets/my', middlewares_1.isAuthenticated, bets_controllers_1.getMyBets);
    router.get('/bets/my/list', middlewares_1.isAuthenticated, bets_controllers_1.getMyBetsList);
    router.get('/bets/user/:id/list', bets_controllers_1.getUserBetsList);
    router.get('/bets', middlewares_1.isAuthenticated, middlewares_1.isAdmin, bets_controllers_1.getAllBets);
    router.post('/bets', middlewares_1.isAuthenticated, bets_controllers_1.addBet);
};
//# sourceMappingURL=bets.routers.js.map