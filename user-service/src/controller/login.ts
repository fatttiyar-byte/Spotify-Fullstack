import { User } from "../model.js"
import Trycatch from "../Trycatch.js"
//wrapper ==>برای مدیریت خطاهای   تابع
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
//توکن احراز هویت ، بعد لاگین موفق  توکن به کاربر داده میشه
//LOGIN
export const loginUser = Trycatch(async (req, res) => {
      const {  email, password } = req.body
      //نام در لاگین لازم نیست
      let user = await User.findOne({ email })
      //کاربر رو بر اساس ایمیلش پیدا میکنیم
      if (!user) {
            //اگه یوزر وجود نداره  بگه کاربر یافت نشد
            res.status(400).json({ message: 'کاربر یافت نشد.❌' })
            return
            //بعد ارسال ریسپانس متوقف کن کد رو
      }

      const isMatch = await bcrypt.compare(password, user.password)
      //مقایسه پسوورد اصلی و پسوورد رمزنگاری شده
      if (!isMatch) {
            //اگه پسوورد درست نبود :
            res.status(404).json({ message: 'اطلاعات صحیح نمیباشد.' })
            return
      }

      const JWT_SEC = process.env.JWT_SEC as string
      const token = jwt.sign({ _id: user._id }, JWT_SEC, {

            //_id: user._id ==>payload
            //داخل توکن مشخص میکنه این توکن متعلق به  کدوم یوزره
            expiresIn: '10d'
            //توکن تا 10 روز معتبره
      })
      res.status(200).json({
            message: 'ورود با موفقیت انجام شد.',
            user: {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                  //نباید پسوورد اینجا ارسال شه برای بالا بردن امنیت داده ها
            },
            token 
            //ارسال توکن
      })
})



// جریان کلی کد:
// POST /api/v1/user/login
//         ↓
//      loginUser
//         ↓
//    پیدا کردن User
//         ↓
//    بررسی Password
//         ↓
//    ساخت JWT
//         ↓
//    ارسال User + Token



// باجزئیات بیشتر
// کاربر Email + Password می‌فرستد
//               ↓
//         loginUser
//               ↓
//      User.findOne({email})
//               ↓
//         آیا User هست؟
//           ↙       ↘
//         خیر        بله
//         ↓           ↓
//        400    bcrypt.compare()
//                     ↓
//              Password درست؟
//                 ↙      ↘
//               خیر       بله
//                ↓         ↓
//               401      jwt.sign()
//                           ↓
//                      ساخت Token
//                           ↓
//                     Response 200
//                           ↓
//                     User + Token