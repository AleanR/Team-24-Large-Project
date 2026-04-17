"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerification = exports.verifyEmail = exports.logout = exports.register = exports.login = void 0;
const users_model_1 = require("../users/users.model");
const helpers_1 = require("../../helpers");
const jwt_1 = require("../../helpers/jwt");
const email_service_1 = require("../services/email.service");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required!" });
        }
        const user = await (0, users_model_1.getUserByEmail)(email).select('+authentication.password');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }
        const isMatch = await (0, helpers_1.comparePassword)(password, user.authentication.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials!" });
        if (user.isVerified === false) {
            return res.status(403).json({
                message: "Please verify your email before signing in.",
            });
        }
        const token = await (0, jwt_1.createToken)(user._id.toString(), user.email);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 3600000,
        });
        return res.status(200).json({
            ...user.toObject(),
            isAdmin: user.role === 'admin',
            token,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { firstname, lastname, ucfID, major, email, password, username } = req.body;
        if (!firstname || !lastname || !ucfID || !major || !email || !password || !username) {
            return res.status(400).json({ message: "Missing required field(s)" });
        }
        const existingUser = await users_model_1.UserModel.findOne({
            $or: [{ email }, { ucfID }, { username }]
        });
        if (existingUser) {
            return res.status(409).json({ message: "User with provided email, username or UCF ID already exists" });
        }
        const hashedPass = await (0, helpers_1.hashPassword)(password);
        const user = await (0, users_model_1.createUser)({
            firstname,
            lastname,
            ucfID,
            major,
            knightPoints: 1000,
            email,
            isVerified: false,
            username,
            authentication: {
                password: hashedPass,
            },
        });
        const token = await (0, jwt_1.createToken)(user._id.toString(), user.email);
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const otpUrl = `${clientUrl}/verify-email?token=${token}`;
        await (0, email_service_1.sendEmailVerifOTP)(user.email, otpUrl);
        return res.status(201).json({
            message: "Email Verification OTP Sent!",
            otpUrl,
            token, // COMMENT OUT DURING DEPLOYMENT
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
const logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });
    res.status(200).json({ message: "User logged out successfully" });
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return res.status(401).json({ message: "Invalid token" });
        }
        const decoded = await (0, jwt_1.verifyToken)(token);
        const user = await (0, users_model_1.getUserById)(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isVerified = true;
        await user.save();
        return res.json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Token expired or invalid" });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Not authenticated" });
        const user = await (0, users_model_1.getUserById)(req.user.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified." });
        }
        const token = await (0, jwt_1.createToken)(user._id.toString(), user.email);
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
        await (0, email_service_1.sendEmailVerifOTP)(user.email, verifyUrl);
        return res.status(200).json({ message: "Verification email sent." });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resendVerification = resendVerification;
//# sourceMappingURL=authentication.controllers.js.map