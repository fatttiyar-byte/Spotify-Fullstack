
import type { Request, Response } from "express";
//تایپ یعنی اینا برای تایپ اسکریپت هستن
import Trycatch from "../Trycatch.js";
//ایمپورت کردن ترای کش که وظیفه مدیریت خطاها رو داره
import { User } from '../model.js'
//یوزر مدل مانگو دی بی است برای کاربران
import bcrypt from 'bcrypt'
//استفاده از بیکریپت برای هش کردن پسوورد
//* نباید پسوورد به صورت غیر هش شده بره به دیتا بیس این نکته خیلی مهمه
//اگه دیتا لو رفت  پسوورد خام داخلش نی
import jwt from "jsonwebtoken";
//برای احراز هویت است
//کاربر متونه این توکن رو همراه با  ریکوئست بفرسته  تا سرور متوجه بشه که 
//این توکن متعلق به کدام کاربر میباشد ؟

//register
export const registerUser = Trycatch(async (req: Request, res: Response) => {
      //این تابع رو ازین فایل خارج کن تا فایل دیگری بتواند ایمپورت کند وازش استفاده کنه
      const { name, email, password } = req.body
      //اطلاعات تان ، ایمیل و پسوورد کابر را از فرانت میگیره

      let user = await User.findOne({ email })
      //بررسی مانگو  که آیا این ایمیل از قبل وجود داره یا نه ؟
      if (user) {
            res.status(400).json({ message: 'کاربر قبلا ثبت نام کرده .' })
            return
            //ریترن خیلی مهمه باعث میشه بعد ارسال ریسپانس کد اینجا متوقف شه

            //اگه اطلاعات از قبل وجود داشت که میگیم کاربر قبلا ثبت نامم کرده اگر نه 
            //اطلاعات کابرد جدید رو بگیر 
      }
      const hashPassword = await bcrypt.hash(password, 12)
      //خب اینجا هش گذاری پسوور انجام میشه هر چی عدد بیشتری بدیم باعث میشه دیتا پیچیده تر بشن و محاسبه سنگین تر میشه

      //اسم عدد==>salt round , cost
      user = await User.create({
            //یه یوزر جدید در دیتا بیس  ایجاد کن
            //شامل موارد زیر:
            name,
            email,
            password: hashPassword
            //اینجا ما پسوورد رو ذخیره نمیگنیم بلکه پسوورد هش شده رو ذخیره میگنیم

      })
      const JWT_SEC = process.env.JWT_SEC as string
      const token = jwt.sign({ _id: user._id }, JWT_SEC, {
            //_id: user._id ==>داخل جی دابلیو تی  شناسه یوزر قرار میدی
            //JWT_SEC==>کلیدی برای ساین کردن در جی دابلیو تی 
            expiresIn: '10d'
            //توکن بعد از 10 روز منقضی میشه
      }) // ساخت توکن
      res.status(201).json({
            message: 'ثبت نام انجام شد.',
            user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  role: user.role
            },
            token
      })

})
//شمای کلی کار رجیستر در پروژه:
// Client
//   ↓
// POST /api/v1/user/register
//   ↓
// registerUser
//   ↓
// بررسی وجود User
//   ↓
// Hash کردن Password
//   ↓
// ذخیره در MongoDB
//   ↓
// ساخت JWT
//   ↓
// ارسال User + Token





// //با جزئیات بیشتر:
// POST /api/v1/user/register
//               ↓
//         registerUser
//               ↓
//        req.body
//               ↓
//    name/email/password
//               ↓
//     User.findOne({email})
//           ↙       ↘
//        وجود دارد   وجود ندارد
//           ↓            ↓
//         400       bcrypt.hash()
//                        ↓
//                   User.create()
//                        ↓
//                   JWT.sign()
//                        ↓
//                   201 Response
//                        ↓
//               user + token