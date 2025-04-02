import { UserPayment } from "../model/userPaymentSchema.js";

export const getAllUserDetails = async(req,res)=>{
    try {
        const {page=1,limit=20,search=""}=req.query;
        const query = search?{emailId:new RegExp(search,"i")}:{};
        const users = await UserPayment.find(query)
        .skip((page-1)*limit)
        .limit(Number(limit))
        .lean()

        const totalUsers = await UserPayment.countDocuments(query);

        return res.status(200).json({
            success:true,
            users,
            totalPages:Math.ceil(totalUsers/limit)
        })
    } catch (error) {
        console.log("error while fetching all user data",error);
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:error
        })
    }
}

export const verifyPayment = async(req,res)=>{
    try {
        const {emailId,paymentUrl} = req.body;
        const updatedPaymentStatus = await UserPayment.findOneAndUpdate(
            { emailId: emailId,"paymentInfo.paymentUrl":paymentUrl },
            { $set: {"paymentInfo.$.isPaymentVerified":true} },
            { new: true}
        )
        if (!updatedPaymentStatus) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success:true,
            message:"payment verified successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong",
            error:error
        })
        console.log("error while updating the paymnet status", error);
    }
}

export const addTransferTokens = async(req,res)=>{
    try {
        const {emailId,paymentUrl,tokenValue} = req.body;
        const transferTokenValue = await UserPayment.findOneAndUpdate(
            {"emailId":emailId,"paymentInfo.paymentUrl":paymentUrl},
            {$push:{"paymentInfo.$.tokensReceived":{token:tokenValue,time:new Date().toISOString()}}},
            { new: true}
        )
        if (!transferTokenValue) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success:true,
            message:"Token Added Successfully."
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong",
            error:error
        })
        console.log("error while adding token", error);
    }
}