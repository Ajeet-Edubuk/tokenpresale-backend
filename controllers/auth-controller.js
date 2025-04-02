import { registration } from "../model/userModel.js";
import bcrypt from "bcryptjs";
import JWT from 'jsonwebtoken';
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer"
import { fileURLToPath } from 'url';
import path from 'path';
import { otpModal } from "../model/otpModel.js";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv();

export const sendOtpEmail = async (emailId,otp) => {

    const html = `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .otp {
            font-size: 22px;
            font-weight: bold;
            color: #0088cc;
            margin: 20px 0;
            display: inline-block;
            padding: 10px 20px;
            border-radius: 5px;
            background: #f1f1f1;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.5; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
    <div class="container">
        <img src="https://firebasestorage.googleapis.com/v0/b/cv-on-blockchain.appspot.com/o/1742311923425EdubukLogoClean.png?alt=media&token=edc75666-d83e-4829-9cf1-132d1bd43ac3" style="max-width: 120px; margin-bottom: 10px;">
        <div class="header">Verify Your Email</div>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <div class="footer">© 2025 Edubuk</div>
    </div>
</div>
</body>
</html>`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "investment@edubukeseal.org",
                pass: process.env.EmailPass,
            },
        });

        // const response = await fetch(resumeFile);
        // const arrayBuffer = await response.arrayBuffer(); // Convert response to ArrayBuffer
        // const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
        const pdfPath = path.resolve(__dirname, "../utils/edubukConsent.pdf");
        const info = transporter.sendMail({
            from: '"Edubuk" <investment@edubukeseal.org>',
            to: `${emailId},investment@edubukeseal.org`,
            subject: "Email Verification",
            text: "From edubuk",
            html: html,
        });


        return { success: true, info };
    } catch (error) {
        console.log("ERROR:WHILE SENDING MAIL", error);
        return { success: false, error };
    }
};

export const sendOtp = async(req,res)=>{
    const {email}= req.body;
    try {
        if (!email) return res.status(400).json({ message: "Email is required" });
        const otp = crypto.randomInt(100000,999999).toString(); // 6-digit otp
        sendOtpEmail(email,otp);
        await otpModal.findOneAndUpdate(
            {email},
            {otp,createdAt:new Date()},
            {upsert:true,new:true}
        )
        res.status(200).json({ 
            success:true,
            message: "OTP sent successfully" });
    } catch (error) {
        console.log("error while sending otp",error);
        res.status(500).json({
            success:false,
            message:"error while sending otp"});
    }
}

export const userRegistration = async(req,res)=>{
    try {
        const {name,email,phoneNumber,country,password,otp}=req.body;
        const otpRecord = await otpModal.findOne({email})
        
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        };

        await otpModal.deleteOne({ email });

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
        //console.log("user",user)
        const passwordMatched = await bcrypt.compare(password,user.hashedPassword);
        if(!passwordMatched)
        {
            return res.status(200).json({
                error:"Unauthorized user",
                message:"Incorrect password !"
            })
        }

        const token = JWT.sign({_id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"});
        sendEmail(user.email,user.name);
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


const sendEmail = async (emailId,userName) => {

    const html = `<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.5; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
  <!-- Email Header -->
  <div style="text-align: center;">
    <img src="https://firebasestorage.googleapis.com/v0/b/cv-on-blockchain.appspot.com/o/1742311923425EdubukLogoClean.png?alt=media&token=edc75666-d83e-4829-9cf1-132d1bd43ac3" style="max-width: 120px; margin-bottom: 10px;">
  </div>

  <!-- Email Content -->
  <h2 style="color: #007BFF; text-align: center;">Action Required: Submit Your KYC Documents</h2>
  <p>Dear <strong>${userName}</strong>,</p>
  <p>This is a gentle reminder to complete your <strong>Know Your Customer (KYC)</strong> process. Submitting your KYC documents is essential for verifying your account and ensuring uninterrupted access to our services.</p>
  <p>Please click the button below to submit your KYC documents. This process is quick, secure, and will only take a few minutes.</p>

  <!-- Button -->
  <div style="text-align: center; margin-top: 20px;">
    <a href="${process.env.FrontEnd_Url}/dashboard/user/user-status" 
       style="display: inline-block; padding: 12px 20px; background-color: green; border-radius: 5px; color: white; text-decoration: none; font-size: 16px; font-weight: bold;">
      Submit Your KYC
    </a>
  </div>

  <p style="margin-top: 20px;">If you have already submitted your KYC documents, please disregard this email.</p>

  <!-- Support Info -->
  <p style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
    Thank you for your prompt attention to this matter. If you have any questions or need assistance, feel free to contact our support team at 
    <a href="mailto:investment@edubukeseal.org" style="color: #007BFF; text-decoration: none;">investment@edubukeseal.org</a>.
  </p>

  <!-- Signature -->
  <p>Best regards,</p>
  <h3 style="margin-bottom: 5px;">Team, Eduprovince Limited<br></br>(Edubuk)</h3>

  <!-- Footer -->
  <footer style="margin-top: 20px; font-size: 12px; color: #555; text-align: center;">
    <p>© Edubuk. All rights reserved.</p>
  </footer>
</div>`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "investment@edubukeseal.org",
                pass:process.env.EmailPass,
            },
        });

        // const response = await fetch(resumeFile);
        // const arrayBuffer = await response.arrayBuffer(); // Convert response to ArrayBuffer
        // const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
        const pdfPath = path.resolve(__dirname, "../utils/edubukConsent.pdf");
        const info = transporter.sendMail({
            from: '"Edubuk" <investment@edubukeseal.org>',
            to: `${emailId},investment@edubukeseal.org`,
            subject: "KYC Submission Reminder",
            text: "From edubuk",
            html: html,
        });


        return { success: true, info };
    } catch (error) {
        console.log("ERROR:WHILE SENDING MAIL", error);
        return { success: false, error };
    }
};
