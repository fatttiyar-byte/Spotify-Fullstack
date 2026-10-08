import express from "express";
//کارهایی که اکسپرس انجام میده :
// *تعریف روت ها 
//*ساخت سرور
//*  مدیریت ریکوئست و ریسپانس
// * استفاده از میان افزارها یا میدل ور ها
import dotenv from 'dotenv'
//برای خواندن متغیر های محیطی از فایل ==> .env
import connectDB from "./config/db.js";
//اتصال دیتا بیس
import userRoute from './route.js'
//روت کاربران 


dotenv.config()
//فعال کردن فایل ==>.env


const app = express()
//ساخت یک نمونه اکسپرس
//مرکز اصلی سرور ما

app.use(express.json())
//به اکسپرس میگه  ریکوئست هایی که بادی شون  جی سان هستش رو بخون

app.get('/' , (req , res)=>{
    res.send('server is running now')
})
//وقتی کاربر رفت لوکا هاست 3000 اینو نشون بده
//تست بالا بودن سرور

app.use('/api/v1' ,userRoute)
//اتصال به یوزر روت و ساخت مسیر مناسب برای یوزر

const port =process.env.PORT || 3000
//تعیین پورت اجرا ،حالا یااز فایل یا روی پورت 3000
const startServer = async() =>{
    //ساخت تابع آسنکرون یا غیر همزمان 
    //یعنی سرور منتظر اتصال به دیتا بیس میماند برای اجرا
    await connectDB()
    //خب حالا اول به دیتابیس مانگو وصل شو بعد برو مرحله بعد 
    app.listen(port , ()=>{
        //اینجا اکسپرس شروع به گوش دادن روی پورت مشخص میکنه
        console.log(`server is running on port ${port}`)
    })
}

 startServer ()
 //اجرا و فراخوتنی تابع
