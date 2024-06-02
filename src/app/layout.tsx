import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Authprovider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anonymous Msg",
  description: "Real feedback from anonymous person",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Authprovider>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </Authprovider>
    </html>
  );
}
