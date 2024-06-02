import mongoose, { Document, Mongoose, Schema } from "mongoose";

export interface message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface user extends Document {
  username: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMsgs: boolean;
  messages: message[];
}

const UserSchema: Schema<user> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verificationCode: {
    type: String,
    required: [true, "Verifiaction code is required"],
  },
  verificationCodeExpiry: {
    type: Date,
    required: [true, "Verifiaction code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMsgs: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

export const UserModel =
  (mongoose.models.User as mongoose.Model<user>) ||
  mongoose.model<user>("User", UserSchema);
