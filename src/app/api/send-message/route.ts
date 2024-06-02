import connectDB from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { message } from "@/model/User";

export async function POST(request: Request) {
  await connectDB();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }

    // Is user accepting messages
    if (!user.isAcceptingMsgs) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }

    const newMsg = { content, createdAt: new Date() };
    user.messages.push(newMsg as message);
    await user.save();
    
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while adding messages", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
