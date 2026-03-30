import { Router } from "express";
import type{ Request,Response } from "express";
import * as AuthController from "../controllers/auth.controllers.ts"

const authRouter = Router()

// --------------------------apis ----------------------- //

// adding a new user in db 
authRouter.post("/register", AuthController.register)
// identify the user 
authRouter.get("/get-me",AuthController.getMe)
// refreshing the token
authRouter.get("/refresh-token",AuthController.refreshToken)

authRouter.get("/logout",AuthController.logout)

authRouter.get("/logout-all",AuthController.logoutAll)

authRouter.post("/login",AuthController.loginUser)

authRouter.post("/get-verified",AuthController.getverifiedEmail)

export default authRouter;