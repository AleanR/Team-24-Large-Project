"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const games_controllers_1 = require("./games.controllers");
const middlewares_1 = require("../../middlewares");
exports.default = (router) => {
    router.get('/games', games_controllers_1.getPublicGames); // public: upcoming/live games for markets page
    router.get('/games/search', middlewares_1.isAuthenticated, games_controllers_1.searchGames); // search games - users & admin
    router.get('/games/all', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.getAllGames); // all games - admin only
    router.post('/games', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.addGame); // create game - admin only
    router.patch('/games/:id', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.updateGame); // update scores/odds - admin only
    router.patch('/games/:id/score', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.updateScore); // update scores/odds - admin only
    router.delete('/games/:id/cancel', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.cancelGame); // cancel + refund - admin only
    router.delete('/games/:id', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.deleteGame); // hard delete - admin only
    router.put('/games/:id/end', middlewares_1.isAuthenticated, middlewares_1.isAdmin, games_controllers_1.endGame); // resolve payouts - admin only
};
//# sourceMappingURL=games.routers.js.map