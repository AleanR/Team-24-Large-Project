"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = void 0;
const jwt_1 = require("../helpers/jwt");
const users_model_1 = require("../modules/users/users.model");
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        const decoded = await (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(401).json({ message: "Invalid or expired token!" });
    }
};
exports.isAuthenticated = isAuthenticated;
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await (0, users_model_1.getUserById)(req.user.id);
        if (user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(401).json({ message: "Invalid role" });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=index.js.map