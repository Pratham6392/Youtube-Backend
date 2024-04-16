import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import  {ApiError}  from "../utils/ApiError.js";
import  {ApiResponse}  from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { verifyJwt } from "../middlewares/Auth.js";

        const generateAccessTokenAndRefreshToken= async(userId)=>{
    try {

          const user=await User.findById(userId)
          const accessToken= user.generateAccessToken()
          const refreshToken=user.generateRefreshToken()
          user.refreshToken=refreshToken;
          await user.save({validateBeforeSave: false})
          return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(400,"access tokens not generated")
    }

    
          
          }
        const loginUser= async(req,res)=>{

    //get the user details
    //check whether user already exist or not
    //validate password/
    const { username, password }= req.body;

    // console.log(username)

    // console.log(username);

    if(username===""){
       throw new ApiError(400,"Username required")
    }
    if(password===""){
        throw new ApiError(400,"password required")  
    }
    //user verification
    
    const myUser =await User.findOne({
        $or:[{username},{email}]
    })
    if(!myUser){
        throw new ApiError(400,"user not registerd")
    }
    
    
//    console.log(myUser)
    //password verification
    

    const isPasswordValid=await myUser.isPasswordCorrect(password)
    
     if(!isPasswordValid){
        throw new ApiError(400,"Password entered is Incorrect")
     }

    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(myUser._id)


    const loggedUser= User.findById(myUser._id).select("-password -refreshToken")

    const options={
        httpOnly:true,secure:true
    }

    res.
    status(200).cookie("accesss-token", accessToken,options).cookie("refresh-Token",refreshToken,options).
    json(new ApiResponse(200,{
           myUser:loggedUser,accessToken,refreshToken
    },"user logged in succeffully"))




        }
        const logoutUser=async(req,res)=>{
         await  User.findByIdAndUpdate(req.user._id,{
            $set:{
                refreshToken:undefined

            }
         },{new:true}
           )

           const options={
              httpOnly:true,
              secure:true
           }

   return          res.status(200).clearCookie("accessToken",accessToken,options).clearCookie("refreshToken",refreshToken,options).
           json(new ApiResponse(200,{},"User logged out successfully"))
        }

        const refreshAccessToken=async(req,res)=>{

            const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;

            if(!incomingRefreshToken){
                throw new ApiError(40,"Invalid request")
            }

           const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

           if(!decodedToken){
            throw new ApiError(40,"Token not decoded")
           }

          const user= await User.findById(decodedToken._id)

          if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(40,"Refresh token expired")
          }
            const options={
                httpOnly:true,
                secure:true
            }
           const {newaccessToken,newrefreshToken}=await generateAccessTokenAndRefreshToken(user._id)

            return res.status(200).cookie("newaccessToken",newaccessToken,options).cookie("newrefreshToken",newrefreshToken,options).
            json(new ApiResponse(200,{newaccessToken,newrefreshToken},"access token refreshed"))
                 
        } 

        const changeCurrentPassword=async(req,res)=>{

            const { oldPassword ,newPasswaord , confirmPassword}= req.body;

            if((newPasswaord!==confirmPassword)){
                throw new ApiError(400,"new password and confirm password dont match")
            }
            //verify password

            
            const user=await User.findById(req.cookies.refreshToken._id);
            const isPsswordCorrect= await user.isPasswordCorrect(oldPassword);

            if(!isPsswordCorrect){throw new ApiError(400,"Password is Invalid ")}

            user.password=newPasswaord;
           await user.save({validateBeforeSave:false})

           return res.status(200).json(new ApiResponse(200,{},"password changed successfully"))

                 
        }

        const getCurrentUser= async(req,res)=>{
            return res.status(200).json(new ApiResponse(200,req.user,"User fetched successfully"))
        }
           
        const updateUserDeatails=async(req,res)=>{

            const {fullName, email}= req.body;

            if(!(fullName || email)){
                throw new ApiError(400,"Give Fullname and email")
            }
            
           const updatedUser=await User.findByIdAndUpdate(req.user?._id,{$set:{fullName,email}
            },{new:true}).select("-password")

            return res.status(200).json(200,{updatedUser},"user successfully updated")



        }

        const getUserProfile=async(req,res)=>{
            
               const {username}=req.params;

               if(!username){
                throw new ApiError(400,"No user found")
               }

              const channel= User.aggregate([{

                         $match:{username:username?.toLowerCase()}
              },{
                         $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers"
                         }
                        },{
                            $lookup:{
                                from:"subscriptions",
                                localField:"_id",
                                foreignField:"subscriber",
                                as:"subscribedTo"
                            }
                         },{
                            $addFields:{
                                subscribersCount:{$size:"subscribers"}
                            ,
                                subscribedToCount:{$size:"subscribedTo"}
                            ,isSubscribed:
                         
                         {$cond:{
                            if:{$in:[req.user._id,"$subscribers.subscriber"]},
                            then:true,
                            else:false
                         }
                        }
                    }
                }
                ,
                {
                            $project:{
                                fullName:1,
                                email:1,
                                username:1,
                                avatar:1,
                                subscribersCount:1,
                                isSubscribed:1,
                                subscribedToCount:1


                            }
                         }

              ])

              console.log(channel)
              if (!channel?.length) {
                throw new ApiError(404, "channel does not exists")
            }
        
            return res
            .status(200)
            .json(
                new ApiResponse(200, channel[0], "User channel fetched successfully"))
        }


export  {loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, updateUserDeatails,getUserProfile};