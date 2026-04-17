"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameById = exports.updateGameById = exports.createGame = exports.getGameById = exports.getGames = exports.GameModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GameSchema = new mongoose_1.default.Schema({
    sport: { type: String, default: 'Basketball' },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    // Bettor counts per side
    numBettorsHome: { type: Number, default: 0 },
    numBettorsAway: { type: Number, default: 0 },
    // Total KP wagered per side
    totalBetAmountHome: { type: Number, default: 100 },
    totalBetAmountAway: { type: Number, default: 100 },
    // Total bet pool
    betPool: { type: Number, default: 200, required: true },
    // Moneyline - percentage odds for each team win
    homeWin: {
        type: {
            label: { type: String, default: '' }, // e.g. "UCF Win"
            odds: { type: Number, default: 0, required: true }, // e.g. 50% per team
        },
        required: true,
    },
    awayWin: {
        type: {
            label: { type: String, default: '' },
            odds: { type: Number, default: 0, required: true },
        },
        required: true,
    },
    // Scores
    scoreHome: { type: Number, default: 0, required: true },
    scoreAway: { type: Number, default: 0, required: true },
    // Sport Emoji
    emoji: { type: String, default: '🏀' },
    // Betting window timer
    bettingOpensAt: { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },
    // Winner
    winner: { type: String, default: "" },
    // Game lifecycle
    status: {
        type: String,
        enum: ['upcoming', 'live', 'finished', 'cancelled'],
        default: 'upcoming',
    },
}, { timestamps: true });
/////////// FOR FRONTEND - Check game status - /////////////////////////
GameSchema.virtual('computedStatus').get(function () {
    const now = new Date();
    if (this.status === 'cancelled')
        return 'cancelled';
    if (now < this.bettingOpensAt)
        return 'upcoming';
    if (now >= this.bettingOpensAt && now <= this.bettingClosesAt)
        return 'live';
    return 'finished';
});
exports.GameModel = mongoose_1.default.model('Game', GameSchema);
const getGames = () => exports.GameModel.find().sort({ bettingClosesAt: 1 });
exports.getGames = getGames;
const getGameById = (id) => exports.GameModel.findById(id);
exports.getGameById = getGameById;
const createGame = (values) => exports.GameModel.create(values);
exports.createGame = createGame;
const updateGameById = (id, values) => exports.GameModel.findByIdAndUpdate(id, values, { returnDocument: 'after', runValidators: true });
exports.updateGameById = updateGameById;
const deleteGameById = (id) => exports.GameModel.deleteOne({ _id: id });
exports.deleteGameById = deleteGameById;
//# sourceMappingURL=games.model.js.map