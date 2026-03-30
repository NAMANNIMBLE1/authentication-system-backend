import mongoose from "mongoose";
import type{ SessionInterface } from "../schemas/schemas.session.ts";

const sessionSchema = new mongoose.Schema<SessionInterface>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "User is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "refresh token is required"]
    },
    ip: {
        type: String,
        required: [true, "User IP is required"]
    },
    useragent: { // to track the user browser and its version
        type: String,
        required: [true, "User agent is required"]
    },
    revoked: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});


const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel