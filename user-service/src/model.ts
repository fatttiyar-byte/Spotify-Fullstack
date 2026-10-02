import mongoose, { Document, Schema } from "mongoose";



interface IUser extends Document{
      name:string;
      email:string;
      password:string;
      role:"user" | "admin";
      playlist:string[]
}

const schema :Schema<IUser> = new Schema({
      name:{
            type: String,
            required: true,

      },

      email:{
            lowercase :true ,
            trim :true,
            required:true,
            unique: true ,
            type:String,
      },

      password:{
            type :String ,
            required:true,
            minlength:8
      },
      role:{
            type:String,

            enum:["user" , "admin"] ,

            default :"user" ,
      },


      playlist:[
            {type:String,
            required:true,
            }
      ]},
      
      { timestamps:true });

      export const User =mongoose.model<IUser>("User" , schema)



