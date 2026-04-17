"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameStatus = getGameStatus;
const node_cron_1 = __importDefault(require("node-cron"));
const games_model_1 = require("../modules/games/games.model");
function getGameStatus(game, now = new Date(Date.now())) {
    if (game.status === 'cancelled')
        return 'cancelled';
    if (game.status === 'finished')
        return 'finished';
    if (now < game.bettingClosesAt)
        return 'upcoming';
    return 'live';
}
node_cron_1.default.schedule('* * * * *', async () => {
    const now = new Date();
    const games = await games_model_1.GameModel.find({ status: { $in: ['upcoming', 'live'] } });
    const bulk = games.map(game => ({
        updateOne: {
            filter: { _id: game._id },
            update: { $set: { status: getGameStatus(game, now) } }
        }
    }));
    if (bulk.length)
        await games_model_1.GameModel.bulkWrite(bulk);
});
//# sourceMappingURL=status.js.map