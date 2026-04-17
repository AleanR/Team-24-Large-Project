"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refund = exports.awardKnightPoints = exports.deductKnightPoints = exports.getUserbyToken = exports.updateUserById = exports.deleteUserById = exports.createUser = exports.getUserById = exports.getUserByEmail = exports.getUsers = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RedemptionSchema = new mongoose_1.default.Schema({
    rewardId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Reward', required: true },
    rewardName: { type: String, required: true },
    voucherCode: { type: String, required: true },
    pointsCost: { type: Number, required: true },
    redeemedAt: { type: Date, default: Date.now },
});
const TicketRedemptionSchema = new mongoose_1.default.Schema({
    pointsAdded: { type: Number, required: true },
    redeemedAt: { type: Date, default: Date.now },
});
const UserSchema = new mongoose_1.default.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    ucfID: { type: String, required: true },
    knightPoints: { type: Number, default: 1000 },
    major: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    isVerified: { type: Boolean, required: true, default: false },
    authentication: {
        type: {
            password: { type: String, required: true, select: false },
            resetPasswordToken: { type: String, select: false },
            resetPasswordExpires: { type: Date },
        },
        required: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    redemptions: { type: [RedemptionSchema], default: [] },
    ticketRedemptions: { type: [TicketRedemptionSchema], default: [] },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.model('User', UserSchema);
const getUsers = () => exports.UserModel.find();
exports.getUsers = getUsers;
const getUserByEmail = (email) => {
    console.log("We made it here");
    return exports.UserModel.findOne({ email });
};
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) => exports.UserModel.findById(id);
exports.getUserById = getUserById;
const createUser = async (values) => exports.UserModel.create(values);
exports.createUser = createUser;
const deleteUserById = (id) => exports.UserModel.deleteOne({ _id: id });
exports.deleteUserById = deleteUserById;
const updateUserById = (id, values) => exports.UserModel.findByIdAndUpdate(id, values, { returnDocument: 'after', runValidators: true });
exports.updateUserById = updateUserById;
const getUserbyToken = (token) => exports.UserModel.findOne(token);
exports.getUserbyToken = getUserbyToken;
const deductKnightPoints = async (id, amount) => {
    const updatedUser = await exports.UserModel.findOneAndUpdate({
        _id: id,
        knightPoints: { $gte: amount }
    }, { $inc: { knightPoints: -amount } }, { returnDocument: 'after', runValidators: true });
    return updatedUser;
};
exports.deductKnightPoints = deductKnightPoints;
const awardKnightPoints = async (id, amount) => {
    return (0, exports.updateUserById)(id, { $inc: { knightPoints: amount } });
};
exports.awardKnightPoints = awardKnightPoints;
const refund = async (userId, amount) => {
    const updatedUser = await (0, exports.updateUserById)(userId, { $inc: { knightPoints: amount } });
    if (!updatedUser)
        return null;
    return updatedUser;
};
exports.refund = refund;
//# sourceMappingURL=users.model.js.map