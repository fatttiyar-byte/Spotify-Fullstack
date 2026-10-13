import mongoose, { Document, Schema } from "mongoose";

//داکیومنت یک تایپ است که ویژگی های مربوط به داکیومنت های مانگو را به اینترفیس اضافه میکند
//اسکیما برای تعریف ساختار و قوانین  داده ها استفاده میشود
 export interface IUser extends Document {
      ///تعریف اینترفیسی که از داکیومنت های مانگو هم استفاده میکنه
      name: string;
      email: string;
      password: string;
      role: "user" | "admin";
      playlist: string[]
}

const schema: Schema<IUser> = new Schema({
      //ساخت اسکیما مطابق با ای یوزر
      name: {
            type: String,
            required: true,

      },

      email: {
            lowercase: true,
            trim: true,
            //حذف فاصله بین حروف
            required: true,
            //ایمیل اجباریه
            unique: true,
            //ایمیل نباید تکراری باشه
            type: String,
            //نوع ایمیل باید استرینگ باشه
      },

      password: {
            type: String,
            required: true,
            //اجباری است
            minlength: 8
            //حداقل طولش 8 کاراکتر باشه
      },
      role: {
            type: String,

            enum: ["user", "admin"],
            //فقط این دو مقدار مجازن  یعنی یوزر و ادمین
            default: "user",
            //به صورت پیش فرض  روی کاربر تنظیم شده
      },


      playlist: [
            {
                  type: String,
                  required: true,
            }
      ]
},

      { timestamps: true });
      //زمان ساخت و اخرین تغییرات رو نشون میده
      //createdAt = 19:20  مثال:ا
      // updatedAt = 19:30

export const User = mongoose.model<IUser>("User", schema)



