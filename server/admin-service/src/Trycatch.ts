import type { NextFunction, RequestHandler, Request, Response } from "express";


export const Trycatch = <T extends Request = Request>(
      handler:(req:T , res:Response , next:NextFunction)=>Promise<any>
 ) : RequestHandler =>{
      return async(req:Request, res:Response , next:NextFunction)=>{
            try {
                  await handler(req as T,res,next)
            } catch (error:unknown) {
                  const message = error instanceof Error ? error.message : "Unknown error"
                  res.status(500).json({message})
                  
            }
      }
}