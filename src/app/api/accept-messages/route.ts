import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import connectDB from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMsgs } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMsgs: acceptMsgs },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update message acceptance status",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages",error);
    return Response.json(
      {
        success: false,
        message: `Failed to update user status to accept messages`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update message acceptance status',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Message acceptance status updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to get user status to accept messages",error);
    return Response.json(
      {
        success: false,
        message: `Failed to get user status to accept messages`,
      },
      { status: 500 }
    );
  }
}
