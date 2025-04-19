"use client";
import React, { useState } from "react";
import Input from "@/components/Input/Input"
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock,LockKeyholeIcon,KeyIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function Signin() {
  const [formData, setFormData] = useState({ dsid: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("")
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const isFormValid = () => {
    return formData.dsid.trim() !== "" && formData.password.trim() !== "";
  };

  const fetchUserData = async (dsid) => {
    try {
      const response = await axios.get(`/api/user/finduserbyid/${dsid}`);
      setEmail(response.data.email)
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch user data. Please try again.");
      setLoading(false);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid()) {
      toast.error("Please fill in all fields.");
      return;
    }
  
    setLoading(true);
  
    try {
      const userData = await fetchUserData(formData.dsid);
      if (!userData) return;
  
      // Directly use userData.email instead of waiting on setEmail
      const res = await signIn("credentials", {
        email: userData.email,
        password: formData.password,
        redirect: false,
      });
  
      if (res.error) {
        toast.error("Invalid Credentials");
        return;
      }
  
      toast.success("Successfully signed in!");
      const userRoutes = { "2": "/superadmin", "1": "/admin", "0": "/user" };
      router.push(userRoutes[userData.usertype] || "/");
  
    } catch (error) {
      handleSignInError(error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignInError = (error) => {
    if (axios.isAxiosError(error) && error.response) {
      toast.error("Server error: " + (error.response.data.message || "An error occurred."));
    } else {
      toast.error("Invalid Credentials. Please try again.");
    }
  };

  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 bg-[#161950]/10">
      <Toaster />

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">

        <div className="w-full order-2 md:order-1  md:w-1/2 p-8">
          <h2 className="text-center text-3xl font-semibold text-gray-700">Sign In</h2>
          <form onSubmit={handleSubmit} className="mt-6">
            
            <div className="relative mb-4">

              <Input
                id="dsid"
                type="text"
                placeholder="DSID"
                icon={<LockKeyholeIcon size={15} />}
                value={formData.dsid}
                onChange={handleChange}
                className="pl-10 w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="relative mb-4">
              <Input
                id="password"
                type="password"
                icon={<KeyIcon size={15} />}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full"
                required
                disabled={loading}
              />
              <Link href="/forgot">
                <span className="text-xs cursor-pointer hover:underline hover:text-[#161950] font-semibold text-gray-600 mt-2">
                  Forgot Password?
                </span>
              </Link>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-[#161950]/80 text-white py-2 rounded-lg hover:bg-[#161950] transition disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <Link href="/signup">
              <p className="text-xs hover:underline hover:text-[#161950] font-semibold text-gray-600 mt-2">Not a user? Sign up</p>
            </Link>
          </form>
        </div>

        <div className=" border-l-2 border-gray-200 hidden md:block w-full  order-1  md:order-2 md:w-1/2 bg-white text-white  items-center justify-center p-8">
          <div className=" flex justify-center items-center flex-col">
            <Image
              src="/images/user/sitelogo-removebg-preview.png"
              height={250}
              width={250}
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}
