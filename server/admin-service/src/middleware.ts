import type { NextFunction, Request, Response } from "express";
import axios from "axios";
//برای فراخوانی سرویس دیگر
import multer from "multer";
//میدل ور مخصوص فرم دیتا برای آپلود  فایل




interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
} 
//شکل داده کاربری  که از سرویس کاربران برمیگرده

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
//ریکوئست اکسپرس را گسترش میدهد تا فیلد آی یوزر داشته باشه 


export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.token as string

        if (!token) {
            res.status(403).json({ message: 'لطفا ابتدا وارد سایت شوید' })
            return
        }

        const { data } = await axios.get(`${process.env.User_URL}/api/v1/user/me`,{
            headers:{
                token
            }
            //این قلب میدل وره  توکن رو به سرویس کاربران میفرسته تا اعتبار سنجی انجام شه واطلاعات کاربر رو برمیگردونه
        })

        req.user = data
        //اطلاعات کاربر  روی رک ذخیره میشه تا کنترلر های بعدی به اون دسترسی داشته باشن
        
        next()
        //سپس نکست کنترلر رو به میدل ور بعدی میده
    } catch (error) {
        res.status(403).json({ message: 'لطفا ابتدا وارد سایت شوید' })
    }
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'شما دسترسی لازم را ندارید' })
    return
  }
  next()
}

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'شناسه نامعتبر است' })
    return
  }
  next()
}//جلوگیری از خطای  اس کیو ال

//* Multer تنظیمات
const storage = multer.memoryStorage();
//فایل در رم به صورت بافر نگهداری میشه برای آپلود مستقیم به کلودینری مناسبه
const uploadFile = multer({ storage }).single("file");
//فقط یه فایل از فیلد فایل میپذیره
multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })
//ایجاد محدودیت برای فایهایی که میپذیره
export const uploadFiles = multer({ storage }).fields([
  { name: "src", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export default uploadFile;


