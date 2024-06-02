import { message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMsgs?: boolean;
  messages?:Array<message>;
}
