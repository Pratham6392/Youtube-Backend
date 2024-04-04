import mongoose from "mongoose";
import { User } from "./user.models.js";

const subscriptionSchema=mongoose.Schema({
     
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }, 
    channel:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User",
       required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        required:true

    },
    updatedAt:{
        type:Date,
        default:Date.now,
        required:true
    }
})

export const subscription=mongoose.model("Subscription",subscriptionSchema) 