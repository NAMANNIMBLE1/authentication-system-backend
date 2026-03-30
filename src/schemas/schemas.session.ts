import { Document, Types } from "mongoose";

export interface SessionInterface extends Document {
    user: Types.ObjectId; // references Users collection
    refreshTokenHash: string;
    ip: string;
    useragent: string;
    revoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}