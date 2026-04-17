"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailVerifOTP = exports.sendPassResetToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const resend_1 = require("resend");
dotenv_1.default.config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || "NitroPicks <onboarding@resend.dev>";
const sendPassResetToken = async (userEmail, url) => {
    try {
        const { error } = await resend.emails.send({
            from,
            to: [userEmail],
            subject: "Password Reset Token",
            html: `
        <p>
          Please click this <a href="${url}">reset link</a>
          to reset your password. This link is valid for 15 minutes.
        </p>
      `,
        });
        if (error) {
            console.error("Password reset email failed:", error);
        }
        else {
            console.log("Password reset email sent to:", userEmail);
        }
    }
    catch (err) {
        console.error("Password reset email failed:", err);
    }
};
exports.sendPassResetToken = sendPassResetToken;
const sendEmailVerifOTP = async (userEmail, url) => {
    try {
        const { error } = await resend.emails.send({
            from,
            to: [userEmail],
            subject: "Email Verification",
            html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${url}">Verify</a>
      `,
        });
        if (error) {
            console.error("Verification email failed:", error);
        }
        else {
            console.log("Verification email sent to:", userEmail);
        }
    }
    catch (err) {
        console.error("Verification email failed:", err);
    }
};
exports.sendEmailVerifOTP = sendEmailVerifOTP;
//# sourceMappingURL=email.service.js.map