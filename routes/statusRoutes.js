import express from 'express';
import { requiredSignIn } from '../middlewares/auth-middleware.js';
import { createSessionId, getKycStatus } from '../controllers/status-controller.js';
import { getSubmittedDetails, userPayments, verifyDetails } from '../controllers/user-payment-controller.js';

const router = express.Router();

router.post('/create-session',requiredSignIn,createSessionId);
router.get('/get-session-status/:email',requiredSignIn,getKycStatus);
router.post('/create-new-payment',requiredSignIn,userPayments);
router.get('/payment-history/:emailId',requiredSignIn,getSubmittedDetails);
router.get('/verify-details/:emailId/:walletAdd',verifyDetails);
export default router;
