import type { Request, Response } from "express";
import UserModel from "../models/models.users.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.ts";
import { token } from "morgan";
import mongoose from "mongoose";
import sessionModel from "../models/models.session.ts";
import { sendEmail } from "../services/services.email.ts";
import { generateOTP, GetOtpHtml } from "../utils/utils.ts";
import otpModel from "../models/models.otp.ts";



async function register(req: Request, res: Response) {
    const { username, email, password } = req.body || {};

    // validation
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    // check existing user
    const userAlreadyExists = await UserModel.findOne({
        $or: [{ username }, { email }],
    });

    if (userAlreadyExists) {
        return res.status(409).json({
            message: "username or email already exists",
        });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
    });

    const otp = generateOTP()
    const html = GetOtpHtml(otp)

    const otpHash = await bcrypt.hash(otp, 10);

    await otpModel.create({
        email,
        user: newUser._id,
        otpHash
    })
    await sendEmail(email, "OTP verification", `your otp code is 
        ${otp}`, html)

    // // generate token
    // const token = jwt.sign(
    //     { id: newUser._id },
    //     config.JWT_SECRET,
    //     { expiresIn: "1d" }
    // );

    const RefreshToken = jwt.sign(
        { id: newUser._id },
        config.JWT_SECRET as string,
        { expiresIn: "7d" }
    )

    const RefreshTokenHash = await bcrypt.hash(RefreshToken, 10);

    const sessionUser = await sessionModel.create({
        user: newUser._id,
        refreshTokenHash: RefreshTokenHash,
        ip: req.ip,
        useragent: req.headers["user-agent"] || "unknown"
    });

    const AccessToken = jwt.sign(
        {
            id: newUser._id,
            sessionId: sessionUser._id
        },
        config.JWT_SECRET as string,
        { expiresIn: "15m" }
    );


    res.cookie("refreshToken", RefreshToken, {
        httpOnly: true,
        secure: false,      // 🔴 MUST be false on localhost
        sameSite: "lax",    // better for dev
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        message: "user created successfully",
        user: {
            username: newUser.username,
            email: newUser.email,
            verified: newUser.verified
        }
    });
}

async function getMe(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: token not found",
        });
    }

    let decoded: { id: string };

    try {
        decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    return res.status(200).json({
        message: "user found successfully",
        user: {
            username: user.username,
            email: user.email,
        },
    });
}

async function refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    // console.log('req.cookies:', req.cookies);  // Shows ALL cookies
    // console.log('All headers:', req.headers.cookie);  // Raw cookie header [web:35][web:36]
    // console.log('Cookie parser middleware active?');  // Confirm setup

    if (!refreshToken) {
        return res.status(401)
            .json({
                message: "Unauthorized , no refresh token found"
            })
    }

    // getting the prev decoded token 
    const decoded = await jwt.verify(refreshToken, config.JWT_SECRET) as { id: string };

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json({
            message: "session not found"
        })
    }

    // making new token
    const access_token = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: "15m" })
    const refresh_token = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: "7d" })

    const new_refresh_token = bcrypt.hash(refresh_token, 10);

    session.refreshTokenHash = new_refresh_token
    await session.save()

    return res.status(200).json({
        message: "token refreshed successfully",
        access_token: access_token,
        refresh_token: refresh_token
    })
}

async function logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(404).json({
            message: "refresh token not found"
        });
    }

    // get all active sessions (or filter by user later)
    const sessions = await sessionModel.find({ revoked: false });

    let validSession = null;

    for (const session of sessions) {
        const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (isMatch) {
            validSession = session;
            break;
        }
    }

    if (!validSession) {
        return res.status(401).json({
            message: "invalid token"
        });
    }

    validSession.revoked = true;
    await validSession.save();

    res.clearCookie("refreshToken");

    return res.status(200).json({
        message: "user logout successfully"
    });
}

async function logoutAll(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    // finding the all sessions using id and revoked = true
    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "logged out from all devices successfully"
    })
}


async function loginUser(req: Request, res: Response) {
    const { email, password } = req.body || {};

    // 1. validation
    if (!email || !password) {
        return res.status(400).json({
            message: "email and password are required"
        });
    }

    // 2. check user
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        });
    }

    if (!user.verified) {
        return res.status(404).json({
            message: "user is not verified"
        })
    }

    // 3. verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({
            message: "invalid credentials"
        });
    }

    // 4. generate refresh token
    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // 5. create session
    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        useragent: req.headers["user-agent"] || "unknown"
    });

    // 6. generate access token
    const accessToken = jwt.sign(
        {
            id: user._id,
            sessionId: session._id
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    // 7. set cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,      // localhost
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 8. response
    return res.status(200).json({
        message: "login successful",
        user: {
            username: user.username,
            email: user.email
        },
        token: accessToken
    });
}

async function getverifiedEmail(req: Request, res: Response) {
    const { otp, email } = req.body;

    if (!otp || !email) {
        return res.status(400).json({
            message: "OTP and email required"
        });
    }

    const otpDoc = await otpModel.findOne({ email });

    if (!otpDoc) {
        return res.status(404).json({
            message: "OTP not found"
        });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isMatch) {
        return res.status(401).json({
            message: "invalid OTP"
        });
    }

    const user = await UserModel.findByIdAndUpdate(
        otpDoc.user,
        { verified: true },
        { new: true }
    );

    await otpModel.deleteMany({ user: otpDoc.user });

    return res.status(200).json({
        message: "email verified successfully",
        user: {
            username: user?.username,
            email: user?.email,
            verified: user?.verified
        }
    });
}

export { register, getMe, refreshToken, logout, logoutAll, loginUser, getverifiedEmail };