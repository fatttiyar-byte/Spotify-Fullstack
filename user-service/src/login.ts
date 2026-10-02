import { User } from "./model.js"
import Trycatch from "./Trycatch.js"
import  bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
//LOGIN
export const loginUser = Trycatch(async(req , res)=>{
      const {name , email , password} = req.body

      let user = await User.findOne({email})

      if(!user){
            res.status(400).json({message:'کاربر یافت نشد.❌'})
            return
      }

      const isMatch =await bcrypt.compare(password, user.password)

      if(!isMatch){
            res.status(404).json({message:'اطلاعات صحیح نمیباشد.'})
            return
      }

      const JWT_SEC = process.env.JWT_SEC as string
const token = jwt.sign({_id:user._id},JWT_SEC,{
      expiresIn:'10d'
})
res.status(201).json({
      message:'ثبت نام انجام شد.',
      user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
      },
      token
})
})