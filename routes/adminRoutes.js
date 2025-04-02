import express from "express";
import { addTransferTokens, getAllUserDetails, verifyPayment } from "../controllers/admin-controller.js";
import { isAdmin,requiredSignIn } from "../middlewares/auth-middleware.js";

const adminRouter = express.Router();

adminRouter.get("/fetch-users",requiredSignIn,isAdmin, getAllUserDetails);
adminRouter.post("/update-payment-status",requiredSignIn,isAdmin,verifyPayment);
adminRouter.put("/transfered-user-token",requiredSignIn,isAdmin,addTransferTokens);

export default adminRouter