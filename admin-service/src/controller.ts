import type { Request } from "express";

import { Trycatch } from "./Trycatch.js";
import { getBuffer } from "./config/dataUri.js";



interface AuthenticatedRequest extends Request{
      user?:{
            _id:string;
            role:string;
      }
}


export const addAlbum = Trycatch(async(req:AuthenticatedRequest , res)=>{
      if(req.user?.role !== "admin"){
            res.status(403).json({
                  message:"دسترسی ادمین ندارید."
            })
            return
      }

      const {title , description} = req.body

      const file = req.file

      if(!file){
            res.status(400).json({
                  message:"فایلی برای آپلود ارسال نشده ." ,
            })
            return
      }


          const fileBuffer = getBuffer(file);

    if (!fileBuffer) {
        res.status(500).json({
            message: "Failed to generate file buffer",
        });
        return;
    }

})