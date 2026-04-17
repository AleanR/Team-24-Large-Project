"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET = process.env.JWT_SECRET;
const createToken = async (userId, userEmail) => {
    return jsonwebtoken_1.default.sign({ id: userId, email: userEmail }, SECRET, {
        expiresIn: "7d",
    });
};
exports.createToken = createToken;
const verifyToken = async (token) => {
    return jsonwebtoken_1.default.verify(token, SECRET);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map