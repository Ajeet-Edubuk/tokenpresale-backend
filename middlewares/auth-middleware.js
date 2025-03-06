import jwt from 'jsonwebtoken';
import { registration } from '../model/userModel.js';

export const requiredSignIn = (req,res,next)=>{
    try {
        const token = req.header('Authorization');
        if(!token)
        {
            res.status(401).json({
                error:"Access denied",
                message:"auth token required !"
            });
        }
        const decode= jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user=decode
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid Token",
            message: "Token verification failed!",
            error
        });
    }
}

export const isAdmin = async(req,res,next)=>{
    try {
        
        const user = await registration.findById(req.user._id);
        console.log("user",user);
        if(!user)
        {
            return res.status(400).json({
                success:false,
                message:"user does not exist"
            })
        }
        if(user.__v!==1)
        {
            return res.status(401).json({
                success:false,
                message:"UnAuthorized user"
            })
        }
        else
        {
            next();
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
         success:false,
         error,
         message:"Error in Admin middleware",
      })
    }
}