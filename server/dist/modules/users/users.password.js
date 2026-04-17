"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPass = exports.forgotPass = void 0;
const users_model_1 = require("./users.model");
const index_1 = require("../../helpers/index");
const email_service_1 = require("../services/email.service");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await (0, users_model_1.getUserByEmail)(email);
        if (!user) {
            return res.status(404).json({ message: "User not found " });
        }
        const { resetToken, hashed } = await (0, index_1.genResetToken)();
        user.authentication.resetPasswordToken = hashed;
        user.authentication.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetURL = `${clientUrl}/reset-password/${resetToken}`;
        await (0, email_service_1.sendPassResetToken)(user.email, resetURL);
        return res.json({
            message: "Reset token generated",
            resetURL,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPass = forgotPass;
const resetPass = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token || Array.isArray(token)) {
            return res.status(400).json({ message: "Token required to change password" });
        }
        const { password } = req.body;
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest('hex');
        const user = await (0, users_model_1.getUserbyToken)({
            "authentication.resetPasswordToken": hashedToken,
            "authentication.resetPasswordExpires": { $gt: new Date() },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        const hashedPass = await (0, index_1.hashPassword)(password);
        user.authentication.password = hashedPass;
        user.authentication.resetPasswordToken = undefined;
        user.authentication.resetPasswordExpires = undefined;
        await user.save();
        return res.json({ message: "Password updated successfully!" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPass = resetPass;
//# sourceMappingURL=users.password.js.map