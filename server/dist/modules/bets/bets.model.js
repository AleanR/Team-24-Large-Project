"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBetById = exports.createBet = exports.getBetById = exports.getBetsByUserWithGames = exports.getBetsByUser = exports.getBetsByGame = exports.getBets = exports.BetModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
////// Single ///////////
const BetLegSchema = new mongoose_1.default.Schema({
    gameId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game', required: true },
    team: { type: String, enum: ["home", "away"], required: true },
    odds: { type: Number, required: true },
    result: { type: String, enum: ["pending", "win", "lose", "tie", "cancelled"], default: 'pending' }
});
/////// Parlay ////////////
const BetSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    stake: { type: Number, required: true, min: 1 }, // points wagered
    betType: { type: String, enum: ['single', 'parlay'], default: 'single', required: true },
    status: { type: String, enum: ['active', 'win', 'lose', 'refunded'], required: true, default: 'active' },
    ///////////
    legs: { type: [BetLegSchema] },
    ////////////
    totalOdds: { type: Number, required: true, default: 0 },
    expectedPayout: { type: Number, required: true, default: 0 },
}, { timestamps: true });
exports.BetModel = mongoose_1.default.model('Bet', BetSchema);
const getBets = async () => exports.BetModel.find();
exports.getBets = getBets;
const getBetsByGame = (gameId) => exports.BetModel.find({ 'legs.gameId': gameId });
exports.getBetsByGame = getBetsByGame;
const getBetsByUser = (userId) => exports.BetModel.find({ userId });
exports.getBetsByUser = getBetsByUser;
const getBetsByUserWithGames = (userId) => exports.BetModel.find({ userId }).populate('legs.gameId').sort({ createdAt: -1 });
exports.getBetsByUserWithGames = getBetsByUserWithGames;
const getBetById = (id) => exports.BetModel.findById(id);
exports.getBetById = getBetById;
const createBet = (values) => exports.BetModel.create(values);
exports.createBet = createBet;
const deleteBetById = (id) => exports.BetModel.deleteOne({ _id: id });
exports.deleteBetById = deleteBetById;
//# sourceMappingURL=bets.model.js.map