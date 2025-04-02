import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentInfo: [
    {
      amount: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
      paymentUrl:{
        type:String,
        required:true,
      },
      isPaymentVerified:{
        type:Boolean,
        default:false
      },
      tokensReceived:[
        {
          token:String,
          time:String
        }
      ],
      walletAdd: {
      type: String,
      required: true,
    },
    walletVerify: {  // by user via mail
      type: Boolean,
      default: false,
    },
    refferalCode:{
        type:String,
    },
    },
  ],
});

export const UserPayment = mongoose.model("userpayments", paymentSchema);
