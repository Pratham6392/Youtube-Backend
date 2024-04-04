import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"

export const verifyJwt=async(req,res,next)=>{

  try {
      const token=req.cookies?.accessToken ||req.headers("Authorization").replace("Bearer ","")
  
  
      if(!token){
          throw new ApiError(400,"unauthorized request")
      }
  
      
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(400,"No token found ")
        }
  
      
  
      const user=await User.findById(decodedToken._id).select("-password -refreshToken")
      if(!user){
          throw new ApiError(400,"invalid access token")
      }
      req.user=user;
      next();
  } catch (error) {
    throw new ApiError(400,"Invalid Access-Token")
  }
}