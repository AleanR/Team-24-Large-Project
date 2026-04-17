"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refund = refund;
const mongoose_1 = __importDefault(require("mongoose"));
const bets_model_1 = require("../bets/bets.model");
const users_model_1 = require("../users/users.model");
const games_model_1 = require("../games/games.model");
async function refund(gameId) {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const bets = await (0, bets_model_1.getBetsByGame)(gameId).session(session);
        if (!bets)
            throw new Error('Bets not found');
        for (const bet of bets) {
            if (bet.status === 'active') {
                if (bet.betType === 'single' && bet.legs[0].result === 'pending') {
                    bet.legs[0].result = 'cancelled';
                    bet.status = 'refunded';
                    const user = await (0, users_model_1.getUserById)(bet.userId.toString()).session(session);
                    if (!user)
                        throw new Error("User not found");
                    user.knightPoints += bet.stake;
                    await user.save({ session });
                }
                if (bet.betType === 'parlay') {
                    for (const leg of bet.legs) {
                        if (leg.gameId.toString() === gameId && leg.result === 'pending') {
                            leg.result = 'cancelled';
                            break;
                        }
                    }
                    bet.status = 'refunded';
                    const user = await (0, users_model_1.getUserById)(bet.userId.toString()).session(session);
                    if (!user)
                        throw new Error("User not found");
                    user.knightPoints += bet.stake;
                    await user.save({ session });
                }
            }
            await bet.save({ session });
        }
        const game = await (0, games_model_1.getGameById)(gameId);
        if (!game)
            throw new Error('Game not found');
        game.status = "cancelled";
        await game.save();
        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        throw error;
    }
}
//# sourceMappingURL=cancel.service.js.map