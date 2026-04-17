"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardById = exports.getActiveRewards = exports.RewardModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RewardSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['food', 'merch', 'campus', 'athletics', 'digital', 'experience'], required: true },
    description: { type: String, required: true },
    pointsCost: { type: Number, required: true, min: 1 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    quantityRedeemed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    eligibility: { type: String, default: '' },
    redemptionInstructions: { type: String, default: '' },
}, { timestamps: true });
exports.RewardModel = mongoose_1.default.model('Reward', RewardSchema);
const getActiveRewards = () => exports.RewardModel.find({ isActive: true }).sort({ pointsCost: 1 });
exports.getActiveRewards = getActiveRewards;
const getRewardById = (id) => exports.RewardModel.findById(id);
exports.getRewardById = getRewardById;
//# sourceMappingURL=rewards.model.js.map