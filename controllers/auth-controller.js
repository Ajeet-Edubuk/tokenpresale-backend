import { registration } from "../model/userModel.js";
import bcrypt from "bcryptjs";
import JWT from 'jsonwebtoken';


export const userRegistration = async(req,res)=>{
    try {
        const {name,email,phoneNumber,country,password}=req.body;
        if(!name || !email || !phoneNumber || !country || !password ){
            return res.status(400).json({
                "error":"Bad request",
                "message":"All input fields are required !"
            })
        }
        const user = await registration.findOne({email})
        if(user)
        {
            return res.status(400).json({
                success:false,
                message:"email id already registered"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const data = await registration.create({name,email,phoneNumber,country,hashedPassword});
        if(data)
        {
            res.status(200).json({
                success:true,
                message:"You are registered successfully !"
            })
        }
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error while user registration",
            error:error
        });
        console.log("error while user registration",error);
    }
}

export const userLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password)
        {
            return res.status(400).json({
                error:"Bad request",
                message:"All input fields are required !"
            })
        }
        const user = await registration.findOne({email});
        if(!user)
        {
            return res.status(401).json({
                error:"Unauthorized user",
                message:"No user found with this email id "
            })
        }
        const passwordMatched = bcrypt.compare(password,user.hashedPassword);
        if(!passwordMatched)
        {
            return res.status(200).json({
                error:"Unauthorized user",
                message:"Incorrect password !"
            })
        }

        const token = JWT.sign({_id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"});
        res.status(200).json({
            success:true,
            message:"Loggined Successfully !",
            user:{
                name:user.name,
                email:user.email,
                role:user.__v
            },
            token
        })

    } catch (error) {
        res.status(500).json({
            error:error,
            message:"Error while user trying to login",
        })
    }
}

