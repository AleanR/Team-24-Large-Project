import jwt from "jsonwebtoken";

const SECRET = "BEN-SECRET-API";        // change to .env variable

export const createToken = async (userId: string, userEmail: string) => {
    return jwt.sign({ id: userId, email: userEmail }, SECRET, {
        expiresIn: "7d",
    });
};

export const verifyToken = async (token: string) => {
    return jwt.verify(token, SECRET) as { id: string, email: string };
};