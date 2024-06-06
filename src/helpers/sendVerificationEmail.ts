"use server";
import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerficationEmails";
import { ApiResponse } from "@/types/apiResponse";
import nodemailer from "nodemailer";
import { renderToString } from "react-dom/server";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationCode: string
): Promise<ApiResponse> {
  try {
    // // Mail will only send to vg4284@gmail.com and from 'Acme <onboarding@resend.dev>' bcz of testing and unpaid service of resend
    // const { data, error } = await resend.emails.send({
    //   // from: "Vansh <dev@vanshgupta17092003.com>",
    //   from: "Acme <onboarding@resend.dev>",
    //   to: email,
    //   subject: "Anonymous messages - Verification Code",
    //   react: VerificationEmail({ username, otp: verificationCode }),
    // });
    // console.log(data, error);

    // const mailContent = renderToString(
    //   VerificationEmail({ username, otp: verificationCode })
    // );

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Upgrade later with STARTTLS
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.MAIL,
      to: email,
      subject: "Anonymous messages - Verification Code",
      // html: mailContent,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error.message);
        return;
      }
      console.log("Email sent successfully!");
      console.log("Message ID:", info.messageId);
    });

    return { success: true, message: "Verification email send successfully" };
  } catch (emailError) {
    console.error("Error while sending verifcation email", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
