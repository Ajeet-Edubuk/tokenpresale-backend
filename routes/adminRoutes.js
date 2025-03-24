import express from "express";
import { getAllUserDetails, verifyPayment } from "../controllers/admin-controller.js";
import { isAdmin,requiredSignIn } from "../middlewares/auth-middleware.js";

const adminRouter = express.Router();

adminRouter.get("/fetch-users",requiredSignIn,isAdmin, getAllUserDetails);
adminRouter.post("/update-payment-status",requiredSignIn,isAdmin,verifyPayment);

export default adminRouter