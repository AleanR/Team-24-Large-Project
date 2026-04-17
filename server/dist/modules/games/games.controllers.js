"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicGames = exports.deleteGame = exports.cancelGame = exports.endGame = exports.updateScore = exports.updateGame = exports.addGame = exports.searchGames = exports.getAllGames = void 0;
const games_model_1 = require("./games.model");
const cancel_service_1 = require("../services/cancel.service");
const results_service_1 = require("../services/results.service");
const time_1 = require("../../helpers/time");
// GET ALL GAMES
const getAllGames = async (req, res) => {
    try {
        const games = await (0, games_model_1.getGames)();
        return res.status(200).json(games);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllGames = getAllGames;
// SEARCH GAMES
const searchGames = async (req, res) => {
    try {
        const { query } = req.query;
        const { page } = req.query; // PAGINATION
        // Validate all queries
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                message: "Search query is required",
                success: false
            });
        }
        if (!page || typeof page !== 'string') {
            return res.status(400).json({
                message: "Missing page number",
                success: false
            });
        }
        const skip = (parseInt(page) - 1) * 7;
        const searchTerms = query.split(' ').filter(term => term.length > 0);
        // Apply search filter (can only search home & away teams & certain game status)
        const filter = {
            $or: searchTerms.flatMap(term => [
                { homeTeam: { $regex: term, $options: 'i' } },
                { awayTeam: { $regex: term, $options: 'i' } },
                { status: { $regex: term, $options: 'i' } },
            ])
        };
        const total = await games_model_1.GameModel.countDocuments(filter);
        // Limit searches by 7 results per page
        const games = await games_model_1.GameModel.find(filter)
            .select('sport homeTeam awayTeam status homeWin awayWin betPool numBettorsHome numBettorsAway totalBetAmountHome totalBetAmountAway bettingOpensAt bettingClosesAt')
            .limit(7).skip(skip);
        return res.status(200).json({
            page,
            total,
            totalPages: Math.ceil(total / 7),
            results: games
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.searchGames = searchGames;
// ADD GAMES
const addGame = async (req, res) => {
    try {
        const { homeTeam, awayTeam, date, time, emoji, homeOdds, awayOdds } = req.body;
        console.log(emoji);
        if (!homeTeam || !awayTeam || !date || !time || !emoji || !homeOdds || !awayOdds) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }
        if (typeof homeTeam !== 'string' || typeof awayTeam !== 'string') {
            return res.status(400).json({ message: "Team names must be string" });
        }
        // Validate Date instances for betting window
        const betStart = new Date(Date.now());
        const betClose = new Date(`${date}T${(0, time_1.formatTime)(time)}:00`);
        if (!(betStart instanceof Date && !isNaN(betStart.getTime()))
            || !(betClose instanceof Date && !isNaN(betClose.getTime()))) {
            return res.status(402).json({ message: "Invalid dates" });
        }
        // Validate betting window
        if (betClose <= betStart) {
            return res.status(400).json({ message: "Invalid betting window" });
        }
        const homeWin = { "label": `${homeTeam.split(' ')[1]} Win`, "odds": homeOdds };
        const awayWin = { "label": `${awayTeam.split(' ')[1]} Win`, "odds": awayOdds };
        // creating Game
        await (0, games_model_1.createGame)({
            sport: emoji.split(' ')[0],
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            homeWin: homeWin,
            awayWin: awayWin,
            bettingOpensAt: betStart,
            bettingClosesAt: betClose,
            emoji: emoji.split(' ')[1],
            status: 'upcoming'
        });
        return res.status(201).json({
            message: "Game created successfully",
            // game
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.addGame = addGame;
// UPDATE GAMES
const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { homeTeam, awayTeam, date, time, emoji, homeOdds, awayOdds } = req.body;
        let dateTime = '';
        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }
        if (isNaN(Number(homeOdds)) || isNaN(Number(awayOdds))) {
            return res.status(400).json({ message: "Odds must be integers" });
        }
        const game = await (0, games_model_1.getGameById)(id);
        if (!game)
            return res.status(400).json({ message: "Game not found" });
        if (date && time) {
            dateTime = `${date}T${(0, time_1.formatTime)(time)}:00`;
        }
        const newTime = new Date(dateTime);
        game.sport = emoji.split(' ')[0];
        game.homeTeam = homeTeam;
        game.awayTeam = awayTeam;
        game.bettingClosesAt = newTime;
        game.homeWin.odds = Number(homeOdds);
        game.awayWin.odds = Number(awayOdds);
        game.emoji = emoji.split(' ')[1];
        await game.save();
        return res.status(200).json({ message: "Game updated successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateGame = updateGame;
// UPDATE GAME SCORES
const updateScore = async (req, res) => {
    try {
        const { id } = req.params;
        const { team, score } = req.body;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Game ID is required" });
        }
        if (!team || !score) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }
        console.log(team, score);
        const numScore = Number(score);
        const game = await (0, games_model_1.getGameById)(id);
        if (!game) {
            return res.status(400).json({ message: "Game not found" });
        }
        if (team === 'home') {
            game.scoreHome += numScore;
        }
        else {
            game.scoreAway += numScore;
        }
        await game.save();
        return res.status(200).json({ message: "Score updated successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateScore = updateScore;
const endGame = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }
        await (0, results_service_1.gameOver)(id);
        return res.status(200).json({ message: "Game ended successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.endGame = endGame;
// CANCEL GAME — refund all bettors and mark as cancelled (does not delete)
const cancelGame = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }
        await (0, cancel_service_1.refund)(id);
        return res.status(200).json({ message: "Game cancelled and all bets refunded" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.cancelGame = cancelGame;
// DELETE GAME — hard delete, admin only, use only when game was created by mistake
const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(400).json({ message: "Unauthorized" });
        }
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "Game ID is required" });
        }
        const game = await (0, games_model_1.getGameById)(id);
        if (!game)
            return res.status(404).json({ message: "Game not found" });
        await (0, games_model_1.deleteGameById)(id);
        return res.status(200).json({ message: "Game deleted" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteGame = deleteGame;
// PUBLIC — list upcoming/live games for frontend markets page
const getPublicGames = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const games = await games_model_1.GameModel.find({
            bettingClosesAt: { $gt: oneDayAgo },
        })
            .select('sport homeTeam awayTeam homeWin awayWin scoreHome scoreAway emoji betPool numBettorsHome numBettorsAway totalBetAmountHome totalBetAmountAway bettingOpensAt bettingClosesAt status')
            .sort({ bettingOpensAt: 1 });
        const startOfToday = new Date(now);
        startOfToday.setUTCHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setUTCHours(23, 59, 59, 999);
        const computed = games.map((g) => {
            const obj = g.toObject();
            if (obj.status === 'cancelled' || obj.status === 'finished')
                return obj;
            if (now > g.bettingClosesAt) {
                obj.status = 'finished';
            }
            else if (g.bettingClosesAt >= startOfToday && g.bettingClosesAt <= endOfToday) {
                obj.status = 'live';
            }
            else {
                obj.status = 'upcoming';
            }
            return obj;
        });
        return res.status(200).json(computed);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getPublicGames = getPublicGames;
//# sourceMappingURL=games.controllers.js.map