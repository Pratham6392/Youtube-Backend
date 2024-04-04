import {v2 as cloudinary} from "cloudinary"
import fs from "fs";
import { ApiError } from  "./ApiError.js";
import dotenv from "dotenv"
dotenv.config({
  path:"./env"

})


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary=async(localPath)=>{
    
   try{
    if(!localPath){throw new ApiError(400,"No file is there in local system")}
    fs.readFile(localPath, (error, data) => {
      if (error) {
        console.error('Error reading file:', error);
        return;
      }
      console.log('File contents:', localPath); // Data is a Buffer object
    });
    

    
    //  const localFilePath = path.join(__dirname, "public/temp/logo (1).png")
    // console.log(localFilePath)
    
     const responce= await cloudinary.uploader.upload(localPath,{resource_type:"auto"});
     console.log(localPath)
    //  console.log(responce)
    
     
     return responce.url;
     
   } catch (error) {
    
        fs.unlinkSync(localPath)//remove the locally saved temporary file as the upload operation got failed
        console.log(error.message)
        return null;
   }


}


export {uploadOnCloudinary};


          
// cloudinary.config({ 
//   cloud_name: 'dlrs9loan', 
//   api_key: '481664425411122', 
//   api_secret: 'i5PcBkrPjThtyAgaII31p9yRVB4' 
// });
// import {v2 as cloudinary} from 'cloudinary';
          
// cloudinary.config({ 
//   cloud_name: 'dtbwmigpp', 
//   api_key: '887272325747861', 
//   api_secret: 'vkt0m45Dvdxapy6mfztJHS1rHjs' 
// });