import mongoose from "mongoose";

import 'dotenv/config';

const db_name= "videotube";

const dbconnect = async () => {
  try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)
      console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
      console.log("MONGODB connection FAILED ");
      process.exit(1)
  }
}

export default dbconnect;