"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react"

import {
  ShieldCheck,
  Mail,
  Lock,
  Shield,
  Lock as LockIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";
import SocialLogin from "@/components/auth/SocialLogin";

interface LoginData {
  email: string;
  password: string;
}


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const router = useRouter();

  const handleLogin: SubmitHandler<LoginData> = async (data) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        Swal.fire({
          title: "Login Successful!",
          text: "Welcome back to Anti-Ragging BD.",
          icon: "success",
          timer: 2000,
          showConfirmButton: true,
          timerProgressBar: true,
        });
        router.push("/");
        // router.refresh();
      } else {
        Swal.fire({
          title: "Login Failed",
          text: result?.error || "Invalid email or password. Please try again.",
          icon: "error",
          confirmButtonColor: "var(--p)",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again later.",
        icon: "error",
        confirmButtonColor: "var(--p)",
      });
    }
  };

  return (
    <div className="max-w-md w-full">
      {/* Login Card */}
      <div className="bg-base-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-base-200">
        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-base-content mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-base text-base-content/60">
              Log in to your account to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label
                className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`block w-full pl-11 pr-4 py-3 bg-base-200/50 border ${errors.email ? "border-error" : "border-base-300"
                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base-content`}
                  placeholder="name@university.edu"
                  type="email"
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className={`block w-full pl-11 pr-12 py-3 bg-base-200/50 border ${errors.password ? "border-error" : "border-base-300"
                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base-content`}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
              <div className="flex justify-end mt-2">
                <Link
                  href="#"
                  className="text-xs text-primary font-medium hover:underline underline-offset-2 transition-all"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="pt-2">
              <button
                className="w-full bg-primary text-primary-content font-semibold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                Log In
              </button>
            </div>
          </form>
          <div className="mt-6">
            <SocialLogin />
          </div>
          <div className="mt-8 pt-8 border-t border-base-200 text-center">
            <p className="text-sm text-base-content/70">
              Don't have an account?{" "}
              <Link
                className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
                href="/register"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Trust Badge */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
        <div className="flex items-center gap-2">
          <LockIcon className="w-4 h-4 text-base-content" />
          <span className="text-xs font-medium text-base-content">
            Secure Data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-base-content" />
          <span className="text-xs font-medium text-base-content">
            Privacy Guaranteed
          </span>
        </div>
      </div>
    </div>
  );
}
