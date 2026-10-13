import type { NextFunction , Request , Response} from "express";
import axios from "axios"
//کتابخانه ا ی برای ارسال درخواست اچ تی تی پی
//ارتباط بین دو میکروسرویس
import dotenv  from 'dotenv'
import multer from "multer";
//یک میان افزار  برای دریافت فایل در درخواست های ==>multipart/form-data
//مثلا یه زمانی هس کاربر تصویری رو برای کاور آلبوم انتخاب میکنه ،فرانت اند میتونه فایل رو با یه درخواست پست به بک اند بفرسته و مولتر اون فایل رو از درخواست استخراج میکنه.
//نکته : مولتر به تنهای فایل رو در کلودینری آپلود نمیکنه . فقط فایل رو دریافت و طبق تنظیمات  آن را در اختیار برنامه قرار میده.

dotenv.config()

interface IUser{
      //مشخص میکنه یک شی چه ویژگی هایی باید داشته باشه و نوع هر ویژگی چیه.
      _id: string;
      name:string;
      email:string;
      password:string;
      role:string;
      playlists: string[];
}

interface AuthenticatedRequest extends Request{
      // Autenticetedrequest==>تمام ویژگی های استاندارد درخواست اکسپرس رو داره و یک ویژگی جدید به نام یوزر هم به اون اضافه میکنه
      user?: IUser | null
      //؟==>یعنی ویژگی یوزر اختیاریه و ممکنه اصلا وجود نداشته باشه 
      //Iuser | null ==>یعنی مقدار یوزر در صورت وجود میتونه یک شی کاربر باشه یا نال باشه.
}



export const isAuth = async (req:AuthenticatedRequest , res : Response ,
      //یک تابع میان افزار سفارشی در اکسپرس 
      //هدف اینه که پیش از اجرای بعضی روت ها اعتبار کاربر بررسی بشه
      
      next:NextFunction) :Promise<void> =>{

            //promise==>تابع نتیجه غیر همزمان برمیکردونه
            //void==>قرار نیست مقدار  مشخصی مثل یک شی کاربر رو به عنوان خروجی تابع برگردونه
            //این تابع از طریق پاسخ به کلاینت پاسخ میده یا با نکست پردازش رو ادامه میده ،اطلاعات رو به صورت بازگشتی برنمیگردونه
      try {
            const token = req.headers.token as string
            //توکن هدر در قالب رشته دریافت میشه
            if(!token){
                  //اگه توکن احراز هویت نداشت میگه برو ثبت نام انجام بده اول
                  res.status(403).json({message:'لطفا ابتدا وارد سایت شوید.'})
                  return
            }

            const {data} = await axios.get(`${process.env.User_URL}/api/v1/user/me` ,{
                  //هسته اصلی معماری میکرو سرویس
                  headers:{
                        token
                        //ارسال توکن به سرویس کاربران
                  }
            })
            req.user= data
            //اطلاعات برگشتی از یوزر سرویس رو به درخواست جاری اضافه میکنه
            next()
      } catch (error) {
            res.status(403).json({message:'لطفا ابیتدا وارد سایت شوید.'})
      }
}


const storage = multer.memoryStorage()
//به مولتر میگیم فایل دریافتی رو موقتا در حافظه رم نگه دار نه اینکه مستقیما اون رو توی یه فایل روی دیسک ذخیره کنی.
export const uploadFile =multer({storage}).single('file')
//آپلود فایل


//جریان کلی:
// Frontend
// ارسال درخواست همراه با Token

// Admin Service
// اجرای Middleware به نام isAuth

// User Service
// بررسی اعتبار Token در مسیر /api/v1/user/me

// بازگشت اطلاعات کاربر
// قرار گرفتن اطلاعات در req.user و ادامه درخواست