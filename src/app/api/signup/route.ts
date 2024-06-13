import connectDB from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

// file name should be route.js and grand parent folder name should be api

export async function POST(request: Request) {
  await connectDB();
  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerifred: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingVerifiedUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingVerifiedUserByEmail) {
      if (existingVerifiedUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already used",
          },
          { status: 400 }
        );
      } else {
        const hashedPass = await bcrypt.hash(password, 10);
        existingVerifiedUserByEmail.password = hashedPass;
        existingVerifiedUserByEmail.verificationCode = verifyCode;
        existingVerifiedUserByEmail.verificationCodeExpiry = new Date(
          Date.now() + 60 * 60 * 1000
        );

        await existingVerifiedUserByEmail.save();
      }
    } else {
      const hashedPass = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPass,
        verificationCode: verifyCode,
        verificationCodeExpiry: expiryDate,
        isVerifred: false,
        isAcceptingMsg: true,
        messages: [],
      });

      await newUser.save();
    }

    const transporter = await nodemailer.createTransport({
      // host: "smtp.gmail.com",
      // port: 465,//587 465
      service: process.env.MAIL_SERVICE,
      // secure:true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });


    // Define email options
    const mailOptions = {
      from: "anonymousmessagesweb@gmail.com",
      to: email,
      subject: "Anonymous messages - Verification Code",
      text: `Here's your verification code: ${verifyCode}\n\nHello ${username}\n\nThank you for registering. Please use the following verification code to complete your registration:\n\n${verifyCode}\n\nIf you did not request this code, please ignore this email.`,
    };

    // Send email
    await transporter.sendMail(mailOptions, (err: any, info: any) => {
      if (err) {
        console.error("Error occurred:", err.message);
        return Response.json(
          {
            success: false,
            message: err.message,
          },
          { status: 500 }
        );
      }
      console.log("Email sent successfully!");
      console.log("Message ID:", info.messageId);
    });

    return Response.json(
      {
        success: true,
        message: "User registered successfully, Please verify your email",
      },
      { status: 201 }
    );

    // send verification email
    // const emailResponse = await sendVerificationEmail(
    //   email,
    //   username,
    //   verifyCode
    // );
    // console.log(emailResponse);

    // if (!emailResponse.success) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: emailResponse.message,
    //     },
    //     { status: 500 }
    //   );
    // }
  } catch (error) {
    console.log("Error while registering user");

    Response.json(
      { success: false, message: "Error while registering user" },
      { statusText: "Error while registering user", status: 500 }
    );
  }
}
