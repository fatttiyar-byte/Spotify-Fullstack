import 'dotenv/config'
//متغیر های محیطی را از فایل دات ای ان وی به صورت خودکار در کانفیگ بارگزاری میشوند
import express from 'express'
//برای ساخت سرور اچ تی تی پی سرور اکسپرس ایمپورت میشه
import { sql } from './config/db.js'
//ایمپورت دیتا  برای نوشتم کدهای اس کیو الی
import adminRoutes from './route.js'
//روتر اصلی ادمین
import cloudinary from './config/cloudinary.js'
//نمونه پیکربندی شده کلودینری را ایمپورت میکنه
import { createClient } from 'redis'
//تابع کریت کلاینت از ردیس ایمپورت میشه
import cors from 'cors'
//میدل ور برای اجازه دادن به درخواست های  فرانت اند==>CROSS-ORIGIN

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
  throw new Error('Redis environment variables are missing (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)')
}
// بررسی وجود متغیرهای محیطی

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD!,
  //پسوورد ردیس
    socket : {
    //این مشخص میکنه پورت به کجا وصل شه
    //چجوری وصل شه مثلا با ==>connecttime out or tls or reconnectstragy
    //با عبارتی آدرس  و شرایط اتصال فیزیکی  را مشخص میکند
    host: process.env.REDIS_HOST,
    //هاست ردیس
    port: Number(process.env.REDIS_PORT),
    //پورت ردیس که به عدد تبدیل میشه
    tls:process.env.REDIS_TLS==='true',
    //محافظت از محرمانگی داده ها و شنود 
    //تضمین یکپارچگی داده ها  و جلوگیری از دستکاری داده ها 

    connectTimeout: 10000,
    //حداکثر 10 ثانیه برای برقراری اتصال تلاش میکنه
  },
})

redisClient.on('error', (err) => console.log('Redis Client Error:', err))
//هر وقت کلاینت ردیس خطا داد  این تابع صدا زده بشه و خطا لاگ بشه
//کلاینت ردیس یک ==>event emitter
//وقتی خطا پیش میاد  رویداد ارور را امیت میکند
redisClient.connect()
  .then(() => console.log('✅ Connect To Redis'))
  //اگه اتصال موفق بود بگو کانکت شده
  .catch((error: any) => console.log('Redis connection failed:', error))
  //اگه وصل نشد ارور بده


const app = express()
//یه نمونه از اکسپرس ساخته میشه و  همه  ی میدل ور ها و  روت ها روی همین اپ تنظیم میشن
app.use(cors())
//میدل ور کورس رو برای همه ی  درخواست ها فعال میکنه 
app.use(express.json())
//بدنه ی درخواست ها رو در رک دات بادی قرار میده اگه نباشه خطای آندیفایند میده
async function initDB() {
  //مقادیر دیتا به صورت پارامتر امن ارسال میشن
  try {
    //اگه آلبوم وجود نداشت جدول آلبوم رو درست کن
    //کلید اصلی
    //عنوان،توضیحات  و کاور آلبوم که همشون ام نباید نال باشن و باید مقدار داشته باشن
    //زمان ایجاد پیش فرض زمان فعلی است
    await sql`
      CREATE TABLE IF NOT EXISTS albums(
      id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    //جدول آلبوم اگر وجود نداشت ساخته بشه
    //یه کلید اصلی داریم
    //عنوان ، توضیحات ،کاور و صوت 
    //کلید خارجی بهه جدول آلبوم ، اگه آلبومی حذف شه آهنگ هاش حذف نمیشه و
    //آلبوم آیدیشون نال میشه و آهنگ تکی میشه
    await sql`
      CREATE TABLE IF NOT EXISTS songs(
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        audio VARCHAR(255) NOT NULL,
        album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Error initDB:', error)
    throw error
  }
}

app.use('/api/v1', adminRoutes)
//روت ها

const port = process.env.PORT || 7000
//پورت
const startServer = async () => {
  
  await initDB()
  app.listen(port, () => {
    console.log(`✅ Server started on http://localhost:${port}`)
  })
  //ترتیب مهم است اول منتظر میماند جدولها آماده شوند بعد سرور شروع به گوش دادن میکنه
  //هیچ درخواستی قبل آماده شدن دیتا بیس پذیرفته نمیشه
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
//اگه اینیت دیتا و ردیس وصل نشن اینجا ارور میده و برنامه با کد  یک که نشانه شکسته خاتمه پیدا میکنه