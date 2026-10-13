import DataURIParser from "datauri/parser.js";
//datauriparser==>ابزاری برای تبدیل اطلاعات فایل به فرمت ==>data uri
import path from "path";
//ماژول داخلی نود جی اس که برای کار با مسیر و نام فایلها استفاده میشه.



const parser = new DataURIParser()
//یه نمونه از  datauriparser میسازیم
//تا از متدهاش بتونیم استفاده کنیم

//parser==>ابزاریه که باهاش فایلها رو تبدیل میکنیم

export const getBuffer =(file:any) =>{
      //یه تابع به نام گت بافر تعریف میکنیم 
      const extName = path.extname(file.originalname).toString()
      //نام اصلی فایل
      //path.extname==>پسوند رو از نام فایل جدا میکنه 
      return parser.format(extName , file.buffer).content

      //pars.format==>با استفاده از پسوند و محتوای فایل دیتا یو آر ای میسازه
      //extName==>پسوند فایل 
      //file.buffer==>محتوای واقعی فایل که مولتر در حافظه نگه داشته
      //content==>بخش دیتا یو آر ای ساخته شده رو برمیگردونه
      //محتوای فایل به شکل بافر
}



// جریان
// ۱. درخواست فرانت‌اند
// ارسال فایل آهنگ یا تصویر

// ۲. Multer
// دریافت فایل و قرار دادن محتوای آن در file.buffer

// ۳. تابع getBuffer
// تبدیل Buffer به Data URI

// ۴. Cloudinary
// آپلود فایل و دریافت آدرس آن

// ۵. دیتابیس Neon
// ذخیره آدرس فایل در جدول آهنگ‌ها یا آلبوم‌ها