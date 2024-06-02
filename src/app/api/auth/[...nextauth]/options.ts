import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
// import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await connectDB();
        console.log("credentials", credentials);

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account first before login");
          }

          const isPassCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPassCorrect) {
            console.log("Returning user", user);
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "3",
    // }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // console.log("SignIn ", user);

      return true;
    },
    async jwt({ token, user }) {
      // console.log("option.ts user", user, token);
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMsgs = user.isAcceptingMsgs;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("Session", session);

      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMsgs = token.isAcceptingMsgs;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET_KEY,
};
