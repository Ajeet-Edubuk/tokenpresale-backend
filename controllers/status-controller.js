import { statusModal } from "../model/statusModel.js";
import { configDotenv } from "dotenv";
configDotenv();

const BASE_URL = process.env.Synaps_Base_Url;
const API_KEY = process.env.Synaps_API_Key;

export const createSessionId = async(req,res)=>{
    if(!BASE_URL || !API_KEY)
    {
        return res.status(400).json({
            success:false,
            error:"env variable unavailable",
            message:"base url and api key required"
        })
    }
    
    try {
        const {email} = req.body;
        const data = await statusModal.findOne({userId:req.user._id});
        if(data && data?.sessionId)
        {
            return res.status(200).json({
                message:"Session Id already created",
                success:true,
                sessionId:data?.sessionId
            })
        }
        
        let result = await fetch("https://api.synaps.io/v4/session/init",{
            method:"POST",
            headers:{
                "Content-Type": "application/json",
                "Api-Key":API_KEY
            }
        });
        
        result = await result.json();
        //console.log("result",result);
        if(result?.session_id)
        {
            const status = await statusModal.create({userId:req.user._id,email:email,sessionId:result.session_id})
            if(status)
            {
                return res.status(200).json({
                    success:true,
                    sessionId:result?.session_id,
                    message:"sessionId created"
                })
            }
        } 
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while creating a new session",
            error:error
        })
    }
}


export const getKycStatus = async(req,res)=>{
    if(!BASE_URL || !API_KEY)
    {
        return res.status(400).json({
            success:false,
            error:"env variable unavailable",
            message:"base url and api key required"
        })
    }
    
    try {
        const {email} = req.params;
        const data = await statusModal.findOne({email:email});
        if(data && data?.sessionId)
        {
        //console.log("data",data.sessionId);
        let result = await fetch(`${BASE_URL}/v4/individual/session/${data?.sessionId}`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json",
                "Api-Key":API_KEY
            }
        });
        
        result = await result.json();
        //console.log("result",result);
        if(result)
        {
          res.status(200).json({
            success:true,
            status:result.session.status,
            steps:result.session.steps
          })
        } 
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while fetching session data",
            error:error
        })
    }
}

