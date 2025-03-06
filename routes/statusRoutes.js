import express from 'express';
import { requiredSignIn } from '../middlewares/auth-middleware.js';
import { createSessionId } from '../controllers/status-controller.js';

const router = express.Router();

router.post('/create-session',requiredSignIn,createSessionId);

export default router;
