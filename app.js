import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { upload } from "./src/middlewares/multer.js"
dotenv.config({
    path:"./env"

})

const app=express();


app.use(express.json({limit:"16kb"}))

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))
app.set("view engine","ejs")

app.set("views",path.resolve("./views"))

console.log(`${process.env.CORS_ORIGIN}`)
//working fine
app.use(cookieParser());

app.listen( 3000, () => {
            console.log(` Server is running at port : ${process.env.PORT}`);
})


    
app.post("/public/temp",upload.fields([
    {
          name:"avatar",
          maxCount: 1
    },
    {
        name:"coverImage",
        maxCount: 1
    }]),(req,res)=>{
        // console.log(req.files)
        return res.json(new ApiResponse(200,req.files,"hi"))
        
    })
 app.get("/",(req,res)=>{
 res.render("homepage")
 
 
 
     })
     

app.use(express.urlencoded({extended:true,limit:"16kb"}))

//import routes
import userRoute from "./src/routes/userRoute.js"
import { ApiResponse } from "./src/utils/ApiResponse.js"
import bodyParser from "body-parser"


app.use("/api/v1/users",userRoute)

export default app;
