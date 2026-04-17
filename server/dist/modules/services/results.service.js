"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameOver = gameOver;
const mongoose_1 = __importDefault(require("mongoose"));
const bets_model_1 = require("../bets/bets.model");
const users_model_1 = require("../users/users.model");
const games_model_1 = require("../games/games.model");
async function gameOver(gameId) {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const game = await (0, games_model_1.getGameById)(gameId).session(session);
        if (!game)
            throw new Error('Game not found');
        if (game.status !== "live")
            throw new Error('Game is either upcoming, finished or cancelled');
        const team = game.scoreHome > game.scoreAway ? 'home'
            : game.scoreHome < game.scoreAway ? 'away'
                : 'tie';
        game.winner = team;
        game.status = 'finished';
        await game.save({ session });
        const bets = await (0, bets_model_1.getBetsByGame)(gameId).session(session);
        for (const bet of bets) {
            if (bet.status !== 'active')
                continue;
            // TIE — refund stake to all bettors
            if (team === 'tie') {
                bet.status = 'refunded';
                for (const leg of bet.legs) {
                    if (leg.gameId.toString() === gameId)
                        leg.result = 'tie';
                }
                const user = await (0, users_model_1.getUserById)(bet.userId.toString()).session(session);
                if (!user)
                    throw new Error('User not found');
                user.knightPoints += bet.stake;
                await user.save({ session });
                await bet.save({ session });
                continue;
            }
            // SINGLE BET
            if (bet.betType === 'single') {
                if (bet.legs[0].team === team) {
                    bet.legs[0].result = 'win';
                    bet.status = 'win';
                    const user = await (0, users_model_1.getUserById)(bet.userId.toString()).session(session);
                    if (!user)
                        throw new Error('User not found');
                    user.knightPoints += Math.round(bet.expectedPayout);
                    await user.save({ session });
                }
                else {
                    bet.legs[0].result = 'lose';
                    bet.status = 'lose';
                }
            }
            // PARLAY BETS — only update the leg for this specific game
            if (bet.betType === 'parlay') {
                for (const leg of bet.legs) {
                    if (leg.gameId.toString() === gameId && leg.result === 'pending') {
                        leg.result = leg.team === team ? 'win' : 'lose';
                    }
                }
                const hasLoss = bet.legs.some(l => l.result === 'lose');
                if (hasLoss) {
                    // Any leg losing kills the whole parlay
                    bet.status = 'lose';
                }
                else {
                    const allResolved = bet.legs.every(l => l.result !== 'pending');
                    if (allResolved) {
                        // All legs won — pay out
                        bet.status = 'win';
                        const user = await (0, users_model_1.getUserById)(bet.userId.toString()).session(session);
                        if (!user)
                            throw new Error('User not found');
                        user.knightPoints += Math.round(bet.expectedPayout);
                        await user.save({ session });
                    }
                    // else: still waiting on other games in this parlay — leave as active
                }
            }
            await bet.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        throw error;
    }
}
//# sourceMappingURL=results.service.js.map