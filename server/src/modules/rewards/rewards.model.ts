import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
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

const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);