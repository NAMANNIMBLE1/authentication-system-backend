import mongoose, { Document, Model } from "mongoose";

export interface IOtp extends Document {
    email: string;
    user: mongoose.Types.ObjectId;
    otpHash: string;
    purpose: "verify_email" | "login" | "reset_password";
    expiresAt: Date;
    attempts: number;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
}