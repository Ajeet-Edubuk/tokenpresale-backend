import express from "express";
import { getAllUserDetails } from "../controllers/admin-controller.js";
import { isAdmin,requiredSignIn } from "../middlewares/auth-middleware.js";

const adminRouter = express.Router();

adminRouter.get("/fetch-users",requiredSignIn,isAdmin, getAllUserDetails)

export default adminRouter