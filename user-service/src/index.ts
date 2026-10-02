import express from "express";
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import userRoute from './route.js'


dotenv.config()
//connect datebase
connectDB()

const app = express()
app.use(express.json())

app.get('/' , (req , res)=>{
    res.send('server is running now')
})


app.use('/api/v1' ,userRoute)


const port =process.env.PORT || 3000

const startServer = async() =>{
    await connectDB()
    app.listen(port , ()=>{
        console.log(`server is running on port ${port}`)
    })
}

 startServer ()
