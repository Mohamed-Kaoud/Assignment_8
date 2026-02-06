import { Router } from "express";
import * as US from "./user.service.js"
import { auth } from "../../middlewares/auth.middleware.js";
const userRouter = Router()

userRouter.post("/signup" , US.signup)
userRouter.post("/login" , US.login)
userRouter.patch("/" ,auth, US.updateUser)
userRouter.delete("/" ,auth, US.deleteUser)
userRouter.get("/" ,auth, US.getUser)

export default userRouter