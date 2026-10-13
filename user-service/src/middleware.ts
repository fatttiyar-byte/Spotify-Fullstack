import jwt, { type JwtPayload } from "jsonwebtoken";
//کاربرد ها : ساخت توکن-بررسی توکن - دیکد کردن اطلاعات توکن
import type { NextFunction, Request, Response } from "express";
//typescript type ==>مشخص کننده ساختار اطلاعات در جی سان وب توکن
import { User , type IUser } from "./model.js";
//Iuser ==>مربوط به ساختار اینترفیس
//User ==>مدل برای کار با داده های کاربر
export interface AuthenticatedRequest extends Request{
      //ساخت یک ریکوئست شخصی سازی شده که از  ریکوئست معمولی ارث بری میکنه
      user?: IUser | null
      //یوزر میتونه یه اینترفیس باشه یا نال باشه  و اصلا وجود نداشته باشه
      //؟ ==> optional
}



const isAuth =async(req:AuthenticatedRequest , res :Response , next:NextFunction) 
// isAuth ==>یه میدل ور یا میان افزاره

:Promise<void> =>{
      try {
            const token = req.headers.token as string
            //توکن رو از هدر  درخواست میگیری

            if(!token){
                  res.status(403).json({message:"لطفا ابتدا وارد سایت شوید ..."})

                  return
            }
            const JWT_SEC = process.env.JWT_SEC as string
            const decodeValue = await jwt.verify(token,JWT_SEC) as JwtPayload
            //verify==>ایا توکن معتبره 
            //توکن دستکاری نشده؟
            //آیا توکن منقضی نشده؟
            //آیا secret درسته ؟
            //اگه وکن معتبر بود پی لود آن را برمبگرداند ==>payload
            if(!decodeValue || !decodeValue._id){
                  //برسیی معتبر بودن پی لود 
                  //آیا چیزی از توکن دریافت شده ؟
                  //و آیا آیدی داخل آن وجود داره؟
                  res.status(403).json({message:'توکن نامعتبر است .'})
                  return
            }


            const userId = decodeValue._id
            //کاربری رو پیدا کن که آیدی یکسانی با آیدی دیکد شده داشته باشه

            const user = await User.findById(userId).select('-password')
            //فیلد پسوورد را از نتیجه حذف کن
            //*کار امنیتی بسیار مهم */


            if(!user){
                  res.status(400).json({message:'کاربر  یافت نشد ...'})

                  return
            }


            req.user=user
            next()
            
      } catch (error) {
            res.status(403).json({message:'لطفا ایتدا وارد سایت شوید ...'})
      }
}

export default isAuth




//جریان پروژه:
// Request
//    ↓
// isAuth
//    ↓
// آیا token وجود دارد؟
//    ↓
// JWT معتبر است؟
//    ↓
// _id داخل token وجود دارد؟
//    ↓
// کاربر در MongoDB وجود دارد؟
//    ↓
// req.user = user
//    ↓
// next()
//    ↓
// Controller






// جزئیات بیشتر:
// کاربر درخواست می‌فرستد
//         ↓
// Token را از Header بگیر
//         ↓
// Token وجود دارد؟
//    ↓             ↓
//   نه             بله
//   ↓               ↓
// 403           JWT را verify کن
//                   ↓
//              معتبر است؟
//              ↓          ↓
//             نه          بله
//             ↓            ↓
//            403       _id را بگیر
//                           ↓
//                    User را از MongoDB بگیر
//                           ↓
//                     User وجود دارد؟
//                     ↓          ↓
//                    نه          بله
//                    ↓            ↓
//                   400      req.user = user
//                                 ↓
//                               next()
//                                 ↓
//                            Controller