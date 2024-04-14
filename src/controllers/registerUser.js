import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

// import  {uploadOnCloudinary}  from "../utils/cloudinary.js";
import path from "path";

import {z} from "zod";
dotenv.config({
       path:"./env"
    
    })


const inputDetails = z.object({
    username: z.string(),
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
  });
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  
//   const uploadOnCloudinary=async(localPath)=>{
//      try{
//       if (!localPath) {
//         throw new ApiError(400, "No file is there in local system");
//       }
//       const __dirname = import.meta.dirname;
//       console.log(req.files.avatar[0].path)
//       const localFilePath = path.resolve(__dirname, "localPath", __filename);
//       const responce = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
//       console.log("#######", localPath);
//        return responce.url; 
//      } catch (error) {
//           fs.unlinkSync(localPath)//remove the locally saved temporary file as the upload operation got failed
//           console.log(error.message)
//           return null;
//      }
  
  
//   }

const registerUser=async(req,res)=>{
  
    const { fullName, email, username, password } = req.body;
    // return res.json(new ApiResponse(200,req.files,"user"))
    const parsedResponce=inputDetails.safeParse(req.body);
    if(!parsedResponce.success){
        throw new ApiError(411,"give proper input field")
    }
    console.log("====>",req.files.avatar[0]);
    
    

    
    if(email===""){
        throw new ApiError(400,"email is required");
    }
    if(password===""){
        throw new  ApiError(400,"password is requied");
    }
    if(fullName===""){
        throw new ApiError(400,"fullName is required");
    }
    if(username===""){
        throw new ApiError(400,"username is required");
    }
    const uploadOnCloudinary=async(localPath)=>{
        try{
         if (!localPath) {
           throw new ApiError(400, "No file is there in local system");
         }
         console.log("3333333",avatarLocalPath)
         
         const responce = await cloudinary.uploader.upload(avatarLocalPath, { resource_type: "auto" });
          return responce.url; 
        } catch (error) {
             fs.unlinkSync(localPath)//remove the locally saved temporary file as the upload operation got failed
             console.log(error.message)
             return null;
        }
     
     
     }

   const existingUser= await User.findOne({
    $or:[{username},{password}]
   }
   )

   if(existingUser){
    throw new ApiError(409,"User already registered")
   }

//    console.log(req);
   const avatarLocalPath = req.files?.avatar[0]?.path;

//    console.log( avatarLocalPath);
   
   
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path
   }
   

   if (!avatarLocalPath) {
       throw new ApiError(400, "Avatar file is required")
   }
   
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
       throw new ApiError(400, "Avatar file is required")
   }


   const user=await User.create({
    fullName,email,password,username:username.toLowerCase(),avatar:avatar,coverImage: coverImage?.url || ""
   })

   const createdUser=await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
    throw new ApiError(404,"User not created")
   }

   return res.json(new ApiResponse(200,createdUser,"user registered successfully"))

}

export default registerUser;