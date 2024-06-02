import mongoose from "mongoose";

interface connectionObject {
  isConnected?: number;
}

const connection: connectionObject = {};

const connectDB = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/anonymousMessages` || "",
      {}
    );

    connection.isConnected = connectionInstance.connections[0].readyState;
    console.log(`DB connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
