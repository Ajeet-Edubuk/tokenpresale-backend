import { UserPayment } from "../model/userPaymentSchema.js";


export const getAllUserDetails = async(req,res)=>{
    try {
        const {page=1,limit=2,search=""}=req.query;
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