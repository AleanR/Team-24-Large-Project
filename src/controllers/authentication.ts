import { Request, Response } from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { comparePassword, hashPassword } from '../helpers';
import { createToken } from '../helpers/jwt';
import { UserModel } from '../db/users';

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required!"});
        }

        const user = await getUserByEmail(email).select('+authentication.password');

        if (!user) {
            return res.sendStatus(400).json({ message: "Invalid credentials!"});
        }

        const isMatch = await comparePassword(password, user.authentication!.password);

        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials!"});

        const token = await createToken(user._id.toString(), user.email);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400).json({ message: "Server error"});
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const { firstname, lastname, ucfID, major, email, password, username } = req.body;

        if (!firstname || !lastname || !ucfID || !major || !email || !password || !username) {
            return res.sendStatus(400).json({ message: "Missing required field(s)"});
        }

        const existingUser = await UserModel.findOne({
            $or: [{ email }, { ucfID }, { username }]
        });

        if (existingUser) {
            return res.sendStatus(400).json({ message: "User with provided email, username or UCF ID already exists"});
        }

        const hashedPass = await hashPassword(password);

        const user = await createUser({
            firstname,
            lastname,
            ucfID,
            major,
            pointBalance: 0,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
            email,
            username,
            authentication: {
                password: hashedPass,
            },
        });

        const token = await createToken(user._id.toString(), user.email);


        return res.status(200).json({
            message: "User created successfully!",
            user,
            token,
        });
            
    } catch (error) {
        console.log(error);
        return res.sendStatus(400).json({ message: "Internal server error"});
    }
}