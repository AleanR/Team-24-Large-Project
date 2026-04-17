"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genResetToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const SALT_ROUNDS = 10;
const hashPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(SALT_ROUNDS);
    return bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashed) => {
    return bcrypt_1.default.compare(password, hashed);
};
exports.comparePassword = comparePassword;
const genResetToken = async () => {
    const resetToken = crypto_1.default.randomBytes(128).toString('hex');
    const hashed = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    return { resetToken, hashed };
};
exports.genResetToken = genResetToken;
//# sourceMappingURL=index.js.map