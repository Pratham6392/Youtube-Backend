import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

import  {uploadOnCloudinary}  from "../utils/cloudinary.js";
import path from "path";
import { dirname } from 'path';
import {z} from "zod";


const inputDetails = z.object({
    username: z.string(),
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
  });

const registerUser=async(req,res)=>{
  
    const { fullName, email, username, password } = req.body;
    // return res.json(new ApiResponse(200,req.files,"user"))
    const parsedResponce=inputDetails.saveParse(req.body)
    if(parsedResponce.success){
        return res.ApiError(411,"give proper input field")
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