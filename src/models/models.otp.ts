import mongoose from "mongoose"
import type{ IOtp } from "../schemas/schemas.otp.ts";


const otpSchema = new mongoose.Schema<IOtp>({
    email: {
        type: String,
        required: [true, "email is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "User is required"]
    },
    otpHash: {
        type: String,
        required: [true, "otp is required"]
    }
}, {
    timestamps: true
})


const otpModel = mongoose.model("otp",otpSchema);

export default otpModel;