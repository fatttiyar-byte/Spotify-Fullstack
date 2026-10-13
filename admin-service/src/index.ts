
import express from "express";
//ساخت سرور و تعریف مسیرهای ای پی آی
import dotenv from 'dotenv'
//خواندن اطلاعات محرمانه از دات ای ان وی
import { sql } from "./config/db.js";
//وارد کردن شی یا تابع sql
//ارتباط با پایگاه داده ==>postgreSQL
import adminRoute from "./route.js";
//مسیر ها
import {v2 as cloudinary}  from "cloudinary";
//مدیریت تصاویر و فایلهای رسانه ای در فضای ابری
//از پکیج کلودینری عضو وی 2 رو وارد میکنیم و نامش رو در فایل ==>cloudinary میزاریم

dotenv.config()
//اجازه میده در بخش های دیگر فایل از دات ای ان وی استفاده کنیم.


cloudinary.config({
    //اطلاعات کلودینری رو به ==>sdk آن میدهیم
    cloud_name: process.env.CLOUD_NAME as string,
    //نام فضای کلودینری رو مشخص میکنه
    api_key: process.env.CLOUD_API_KEY as string,
    //کلید ای پی ای حساب رو مشخص میکنه
    api_secret: process.env.CLOUD_API_SEC as string
    //کلید محرمانه ای پی آی که نباید در سمت کد فرانت و یا در گیت هاب قرار بگیره
})

const app = express()
//ساخت نمونه ای از اکسپرس
app.use(express.json())
//اضافه کردن میان افزار به سرور
//middleware==>تابعی است که  در مسیر پردازش درخواست اچ تی تی پی اجرا میشه و میتونه درخواست رو بررسی کنه یا تغییر بده یا پردازش کنه یا بگه که برو مرحله بعد.

async function initDB(){
    //مشخص کننده ساختار جدول های دیتابیس
    //ارتباط با دیتابیس یه عملیاتغیر همزمانه 
    //ارسال کوئری به دیتابیس ممکنه زمان ببره به خاطر همین از ==>async استفاده میکنیم.
      try {
        //نوشتن اس کیو ال به شکل ==>template literal
            await sql
            //جدول آلبوم رو بساز اگه این جدول وجود نداره
            //شناسه هر البوم رو تعریف میکنه ،در سریال پوستگرس اس کیو ال ، معمولا یه عدد صحیح با مقدار افزایشی خودکار ایجاد میکنه ..... در پرایمری کی :یعنی این ستون شناسه یکتای هر ردیفه و نمیتونه مقدارش نال باشه یا خالی باشه
            //خط سوم اس کیو ال :عنوان آلبوم رو نگهداری میکنه ،رشته ای با حداکثر 255 کاراکتر رو مشخص میکنه و این فیلد هم نباید نال باشه یعنی نباید خالی از مقدار باشه .
            //خط چهارم :ای خط توضیحات آلبوم رو ذخیره میکنه . اگه بخای توضیحات طولانی تری داشته باشی میتونی از تکست هم استفاده کی==>text
            //خط پنجم : آدرس تصویر کاور آلبوم رو ذخیره میکنه مثلا یو آر ال تصویری که در کلودینری آپلود شده .خود تصویر ذخیره نمیشه آدرسشهه

            //خط ششم : زمان ایجاد رکورد رو ذخیره میکنه . اگه هنگام درج رکورد مقداری برای این ستون تعیین نشه مقدار پیش فرض همون زمان فعلی استفاده میشه.
            //TIMESTAMP==>نوع داده زمان و تاریخ است
            //DEFAULT CURRENT TIMESTAMP ==>مقدار پیش داده رو مشخص میکنه
            `
            CREATE TABLE IF NOT EXISTS albums(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255) NOT NULL,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;



            //خط70 :ایجاد ارتباط بین آلبوم وآهنگ ها 
            //ایجا یک کلید خارجی تعریف کردیم
            //مقدار آلبوم آیدی باید به شناسه معتبر یک آلبوم اشاره کنه، اگه البومی حذف شه مقدار البوم ایدی و اهنگ های مرتبط با اون به نال تبدیل میشن در نتیجه خود آهنگ ها حذف نمیشن.

            await sql `
            CREATE TABLE IF NOT EXISTS songs(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255) NOT NULL,
            audio VARCHAR(255) NOT NULL,
            album_id INT REFERENCES albums(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

            console.log('database initialized successfully✔');
      } catch (error) {

            console.error('Error initializing database:', error);

            throw error;
            //خطا رو دوباره به فراخواننده ی تابع منتقل میکنه
            //نکته :اگر خطا رو فقط چاپ کنی و دوباره پرتاب نکنی ،ممکنه کد فراخواننده متوجه شکست عملیات نشه،با این خط کد فراخواننده میتونه خطا رو مدیریت کنه البته به شرطی که در مسیر مناسب قرار بگیره
            
      }
}



app.use('/api/v1/' , adminRoute)







const port =process.env.PORT || 3100


const startServer =async()=>{
    try{
        await initDB();

        app.listen(port , ()=>{
            console.log(`serveris running on http://localhost:${port}`);
        })
    }catch(error){
        console.error("Failed tto start server:" , error)

        process.exitCode = 1;
    }
}

 startServer ()



