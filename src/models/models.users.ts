import mongoose from "mongoose";
import type{ UserInterface } from "../schemas/schemas.user.ts";

const UserSchema = new mongoose.Schema<UserInterface>({
    username:{
        type: String,
        required: [true,"username is required"],
        unique:[true,"username must be unique"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:[true,"email must be unique"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    verified:{
        type: Boolean,
        default:false
    }
});

const UserModel = mongoose.model("Users",UserSchema)
export default UserModel;


