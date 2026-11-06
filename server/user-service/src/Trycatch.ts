import type { NextFunction,Request,RequestHandler,Response } from "express";


const Trycatch =(handler:RequestHandler):RequestHandler=>{
      return async (req:Request , res:Response , next:NextFunction) =>{
            //ترای کش یه هندلر میگیره و  یک هندلر جدید میسازه که خطا ها رو کنترل میکنه
            try {
                  await handler(req , res , next)
            } catch (error :any) {

                  res.status(500).json({
                        message:error.message,
                  })
                  
            }
      }
}

export default Trycatch
