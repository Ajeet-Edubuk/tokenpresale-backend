import express from "express";
import { configDotenv } from "dotenv";
import dbConnection from "./config/db-connection.js";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/statusRoutes.js"
import adminRouter from "./routes/adminRoutes.js";
const app = express();

configDotenv();
const mongoURI = process.env.MONGO_URI;
dbConnection(mongoURI);


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/admin',adminRouter);
app.get("/", (req, res) => {
    return res.json({
      message: "Health is ok!",
    });
  });
  
  app.listen(process.env.PORT, () => {
    console.log("Backend running on PORT:", process.env.PORT);
  });

