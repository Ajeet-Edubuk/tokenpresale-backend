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
      tokensReceived:{
        type:String
      },
      walletAdd: {
      type: String,
      required: true,
      unique: true,
    },
    walletVerify: {  // by user via mail
      type: Boolean,
      default: false,
    },
    },
  ],
});

export const UserPayment = mongoose.model("userpayments", paymentSchema);
