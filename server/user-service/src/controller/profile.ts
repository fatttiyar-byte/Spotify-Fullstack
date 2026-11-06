import type { AuthenticatedRequest } from "../middleware.js";

import Trycatch from "../Trycatch.js";




//user profile
export const myProfile = Trycatch(async(req:AuthenticatedRequest , res)=>{
      const user = req.user

      res.json(user)
})

// کل عملیات این بخش:
// GET /api/v1/user/me
//           ↓
//         isAuth
//           ↓
//       JWT بررسی می‌شود
//           ↓
//       user پیدا می‌شود
//           ↓
//       req.user = user
//           ↓
//        myProfile
//           ↓
//       req.user