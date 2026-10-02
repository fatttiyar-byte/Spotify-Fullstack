import express from "express"
import { registerUser } from "./register.js"
import { loginUser } from "./login.js"

const router = express.Router()

router.post('/user/register' , registerUser)
router.post('/user/login' , loginUser)


export default router