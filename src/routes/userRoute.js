import Router from "express";
import registerUser from "../controllers/registerUser.js";
import { loginUser, logoutUser } from "../controllers/loginUser.js";
import { verifyJwt } from "../middlewares/Auth.js";
// import {upload} from "../middlewares/multer.js"
import multer from "multer";
import path from "path";


const router= Router();

const __dirname=import.meta.dirname;


//local file handling
const upload=multer({
    dest: path.resolve(__dirname,"../../public/uploads"),
    limits:{fileSize:3e7}
})

//registerUser
router.route("/registerUser").post(upload.fields([
    {
          name:"avatar",
          maxCount: 1
    },
    {
        name:"coverImage",
        maxCount: 1
    }]),
registerUser)

//login
router.route("/loginUser").post(loginUser)

//logOut
router.route("/logoutUser").post(verifyJwt,logoutUser)

export default router;
