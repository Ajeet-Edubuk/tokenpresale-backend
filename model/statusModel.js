import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Users",
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    sessionId: {
        type: String,
        required:true
    },
    faceLiveness: {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"], 
            default: "pending"
        },
        isSubmitted: {
            type: Boolean,
            default: false
        }
    },
    document: {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        isSubmitted: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true }); 

export const statusModal= mongoose.model("Status", statusSchema);
