import LoginForm from "@/components/admin/loginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Page | Yoruuta Admin Page",
  description: "Yoruuta Admin Page",
};

export default function LoginPage() {
  return <LoginForm/>;
}
