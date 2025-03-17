import { UserPayment } from "../model/userPaymentSchema.js";
import nodemailer from "nodemailer"
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const userPayments = async (req, res) => {
    try {
        const { emailId, walletAdd, paidAmount,method, paymentUrl } = req.body;

        if (!emailId || !paidAmount || !paymentUrl || !walletAdd || !method) {
            return res.status(400).json({
                success: false,
                message: "emailId, paidAmount, paymentUrl, and walletAdd are required.",
                error: "Fields are missing",
            });
        }

        const user = await UserPayment.findOne({ emailId });

        // Attempt to send an email but handle any potential errors.
        try {
            await sendEmail(emailId, walletAdd, paidAmount,method, paymentUrl);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email.",
                error: emailError.message || emailError,
            });
        }

        if (!user) {
            try {
                const data = await UserPayment.create({
                    emailId,
                    paymentInfo: [{amount:paidAmount,method:method,paymentUrl:paymentUrl,walletAdd:walletAdd}],
                });

                if (data) {
                    return res.status(200).json({
                        success: true,
                        message: "Payment data submitted successfully.",
                    });
                }
            } catch (dbError) {
                console.error("Error creating new user payment:", dbError);
                return res.status(500).json({
                    success: false,
                    message: "Error creating new user payment.",
                    error: dbError.message || dbError,
                });
            }
        }

        // If user already exists, update their data
        try {
            await UserPayment.findOneAndUpdate(
                { emailId },
                {
                    $push: {
                        paymentInfo:{amount:paidAmount,method:method,paymentUrl:paymentUrl,walletAdd:walletAdd},
                    },
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: "Payment data updated successfully.",
            });
        } catch (updateError) {
            console.error("Error updating user payment:", updateError);
            return res.status(500).json({
                success: false,
                message: "Error updating payment data.",
                error: updateError.message || updateError,
            });
        }
    } catch (error) {
        console.error("Unexpected error while processing payment data:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message || error,
        });
    }
};


const sendEmail = async (emailId, walletAdd, paidAmount,method, paymentUrl) => {

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <!-- Email Content -->
  <h2 style="color: #007BFF;">Thank You for your Investment at Eduprovince Ltd.</h2>
  <p>We have received your payment data. To make it more secure and authenticate.</p>
  <p>Please verify below all the payment data shared by you:</p>
    <table style="width: 100%; max-width: 600px; border-collapse: collapse; background: #fff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
      <tr style="background-color: #f5f5f5;">
        <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ddd;">Field</th>
        <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ddd;">Value</th>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Paid Amount</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${paidAmount} ${method}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Wallet Address</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${walletAdd}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">Payment Image/PDF</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          <a href="${paymentUrl}" target="_blank" style="color: blue; font-weight: bold; text-decoration: none;">View Image/PDF</a>
        </td>
      </tr>
    </table>
    <a href="http://localhost:8000/api/v1/user/verify-details/${emailId}/${walletAdd}" 
   style="display: inline-block; padding: 10px 16px; margin-top:10px; background-color: green; border-radius: 5px; color: white; text-decoration: none; font-size: 16px;">
   Verify Details
</a>
  <p style="margin-top: 20px;">If you find any incorrect data. Please reach out to us: support@edubukeseal.org</p>
  <footer style="margin-top: 20px; font-size: 12px; color: #555;">
    <p>This email was automatically generated by Eduprovince Limited.</p>
  </footer>
</div>`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "investment@edubukeseal.org",
                pass: "otff yjgd ctsd yppb",
            },
        });

        // const response = await fetch(resumeFile);
        // const arrayBuffer = await response.arrayBuffer(); // Convert response to ArrayBuffer
        // const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
        const pdfPath = path.resolve(__dirname, "../utils/edubukConsent.pdf");
        const info = transporter.sendMail({
            from: '"Edubuk" <investment@edubukeseal.org>',
            to: `${emailId},investment@edubukeseal.org`,
            subject: "Payment Data Received",
            text: "From edubuk",
            html: html,
            attachments: [
                {
                    filename: "edubukConsent.pdf", // Name for the attached file
                    path:pdfPath, // Path to the existing PDF file
                    contentType: "application/pdf",
                },
            ],
        });


        return { success: true, info };
    } catch (error) {
        console.log("ERROR:WHILE SENDING MAIL", error);
        return { success: false, error };
    }
};

export const verifyDetails = async (req, res) => {
    try {
        const { emailId,walletAdd} = req.params;
        if (!emailId || !walletAdd) {
            return res.status(400).json({ success: false, message: "Email ID and wallet address are required" });
        }
        const updatedStatus = await UserPayment.findOneAndUpdate(
            { emailId: emailId,"paymentInfo.walletAdd":walletAdd },
            { $set: {"paymentInfo.$[elem].walletVerify":true} },
            { new: true,arrayFilters:[{"elem.walletAdd": walletAdd}]}
        );

        if (!updatedStatus) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).send(`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); text-align: center;">
                    <h2 style="color: #4CAF50; margin-bottom: 10px;">Payment Details Verified Successfully ✅</h2>
                    <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                        Your payment details has been successfully verified. 
                    </p>
                    <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                        Thank You .
                    </p>
                    <a href="https://tokenpresale.com/dashboard" 
                        style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: 0.3s;">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const getSubmittedDetails = async(req,res)=>{
    try {
        const {emailId} = req.params;
        if(!emailId)
        {
            return res.status(400).json({
                success:false,
                message:"user mailid is required"
            })
        }
        const getUserData = await UserPayment.findOne({emailId:emailId});
        if(!getUserData)
        {
            return res.status(200).json({
                success:true,
                message:"Not Initialized"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Submitted",
            history:getUserData.paymentInfo
        })
    } catch (error) {
        console.log("error while fetching user payment data",error);
        return res.status(500).json({
            success:false,
            message:"something went wrong",
            error:error
        })
    }
}