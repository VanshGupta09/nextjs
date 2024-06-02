"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDebounceValue } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const page = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameMsg, setUsernameMsg] = useState<string>("");
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    username,
    500
  );

  const { toast } = useToast();

  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const checkUniqueUsername = async () => {
    if (debouncedUsername) {
      setIsCheckingUsername(true);
      setUsernameMsg("");
      try {
        const res = await axios.get(
          `/api/check-username-unique?username=${debouncedUsername}`
        );
        setUsernameMsg(res?.data?.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMsg(
          axiosError.response?.data.message ?? "Error while checking username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/signup", data);
      toast({
        title: "Success",
        description: res.data.message,
      });
     
      router.replace(`/verify/${debouncedUsername}`);
    } catch (error) {
      console.error("Error while signUp", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMsg = axiosError.response?.data.message ?? "Error while registering user";
      console.log(errorMsg);
      
      toast({
        title: "SignUp failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUniqueUsername();
  }, [debouncedUsername]);

  return (
    <>
      {/* <p>Debounced value: {debouncedUsername}</p>

      <input
        type="text"
        defaultValue={username}
        onChange={(event) => setDebouncedUsername(event.target.value)}
      /> */}
      <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Anonymous Message
            </h1>
            <p className="mb-4">Sign up to start your anonymous adventure</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <Input
                      {...field}
                      placeholder="username"
                      onChange={(e) => {
                        field.onChange(e);
                        setDebouncedUsername(e.target.value);
                      }}
                    />
                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                    {!isCheckingUsername && usernameMsg && (
                      <p
                        className={`text-sm ${
                          usernameMsg === "Username is available"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {usernameMsg}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} name="email" placeholder="username" />
                    <p className="text-muted text-gray-400 text-sm">
                      We will send you a verification code
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" placeholder="password"/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Already a member?{" "}
              <Link
                href="/signin"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;