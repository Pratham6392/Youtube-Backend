import dotenv from "dotenv";
import dbconnect from "./src/db/dbConnect.js"
import app from "./app.js"
import  Express  from "express";


// const server= Express();


dotenv.config({
    path: './.env'
})

// server.get("/",(req,res)=>{
//     res.send("hello from express")
// })


dbconnect()
// .then(() => {
//     server.listen( 3000, () => {
//         console.log(` Server is running at port : ${process.env.PORT}`);
//     })
// })






