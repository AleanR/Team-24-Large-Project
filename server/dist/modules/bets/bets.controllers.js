"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBet = exports.addBet = exports.getAllBets = exports.getUserBetsList = exports.getMyBetsList = exports.getMyBets = void 0;
const bets_model_1 = require("../bets/bets.model");
const bet_service_1 = require("../services/bet.service");
const getMyBets = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const bets = await (0, bets_model_1.getBetsByUser)(req.user.id);
        const total = bets.length;
        const won = bets.filter(b => b.status === 'win').length;
        const lost = bets.filter(b => b.status === 'lose').length;
        return res.status(200).json({ total, won, lost });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyBets = getMyBets;
const getMyBetsList = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const bets = await (0, bets_model_1.getBetsByUserWithGames)(req.user.id);
        return res.status(200).json(bets);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyBetsList = getMyBetsList;
const getUserBetsList = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const bets = await (0, bets_model_1.getBetsByUserWithGames)(id);
        return res.status(200).json(bets);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserBetsList = getUserBetsList;
const getAllBets = async (req, res) => {
    try {
        const bets = await (0, bets_model_1.getBets)();
        return res.status(200).json(bets);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllBets = getAllBets;
const addBet = async (req, res) => {
    try {
        const { stake, legs } = req.body;
        if (!stake || !legs) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Bets must be array & non-empty
        if (!Array.isArray(legs) || legs.length === 0) {
            return res.status(400).json({ message: "Bets must be non-empty array" });
        }
        const bet = await (0, bet_service_1.placeBet)(req.user.id, stake, legs);
        return res.status(201).json({
            message: "Bet created successfully",
            bet
        });
    }
    catch (error) {
        console.log(error);
        // Surface business-logic errors as 400 so the client sees the real message
        const businessErrors = [
            'User not found',
            'Insufficient funds',
            'Stake exceeds 30%',
            'Invalid bet data',
            'Game not found',
            'Game is cancelled',
            'Betting window closed',
            'Betting not yet open',
            'Game odds data is missing',
        ];
        const msg = error?.message ?? '';
        if (businessErrors.some((e) => msg.includes(e))) {
            return res.status(400).json({ message: msg });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.addBet = addBet;
///////////////// DON'T WORRY ABOUT THIS ///////////////////////////
const removeBet = async (req, res) => {
    try {
        const { betId } = req.params;
        if (!betId || Array.isArray(betId)) {
            return res.status(400).json({ message: "Bet ID is required" });
        }
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const bet = await (0, bets_model_1.getBetById)(betId);
        if (!bet) {
            return res.status(400).json({ message: "Bet not found" });
        }
        // Expired bet
        if (bet.status === "win" || bet.status === "lose") {
            return res.status(400).json({ message: "Bet is already expired" });
        }
        await (0, bets_model_1.deleteBetById)(betId);
        return res.status(200).json({
            message: "Bet removed successfully"
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.removeBet = removeBet;
//# sourceMappingURL=bets.controllers.js.map