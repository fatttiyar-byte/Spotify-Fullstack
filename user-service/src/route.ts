import express from "express"
import { registerUser } from "./controller/register.js"
import { loginUser } from "./controller/login.js"
import { myProfile } from "./controller/profile.js"
import isAuth from "./middleware.js"

const router = express.Router()
//استفاده از روتر های اکسپرس برای مسیر یابی

router.post('/user/register' , registerUser)
router.post('/user/login' , loginUser)
router.get('/user/me',isAuth,myProfile)
// Request
//    ↓
// /user/me
//    ↓
// isAuth
//    ↓
// myProfile







// GET /api/v1/user/me
//         ↓
//       isAuth
//         ↓
//    Token معتبر؟
//      ↙       ↘
//    خیر        بله
//     ↓          ↓
//   401       myProfile
//               ↓
//           اطلاعات کاربر

export default router