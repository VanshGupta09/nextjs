import connectDB from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    const isCodeValid = user.verificationCode === code;
    const isCodeNotExpired = new Date(user.verificationCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code is expired, please sign up again to get a new code ",
        },
        { status: 400 }
      );
    }else{
        return Response.json(
            {
              success: false,
              message:
                "Invalid verification code ",
            },
            { status: 400 }
          );
    }
  } catch (error) {
    console.error("Error while verfying code", error);
    return Response.json(
      {
        success: false,
        message: "Error while verfying code",
      },
      { status: 500 }
    );
  }
}
