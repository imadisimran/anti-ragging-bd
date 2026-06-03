"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Shield,
  Lock as LockIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { registerUser } from "@/actions/server/auth";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import SocialLogin from "@/components/auth/SocialLogin";
import { signIn } from "next-auth/react";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password:string;
}

function RegisterContent() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>();
  const router = useRouter();

  const password = watch("password");

  const handleRegister: SubmitHandler<RegisterData> = async (data) => {
    try {
      const res = await registerUser(data);
      if (res.success) {
        await Swal.fire({
          title: "Registration Successful!",
          text: "Welcome to the community. You can now log in.",
          icon: "success",
        });
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (signInResult?.ok) {
          router.push("/verify-email");
        }
      } else {
        Swal.fire({
          title: "Registration Failed",
          text: res.message || "Something went wrong. Please try again.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again later.",
        icon: "error",
      });
    }
  };

  return (
    <div className="max-w-md w-full">
      {/* Registration Card */}
      <div className="bg-base-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-base-200">
        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-base-content mb-2 tracking-tight">
              Join The Anti Ragging Community
            </h1>
            <p className="text-base text-base-content/60">
              Your safe space for reporting and stopping ragging incidents.
            </p>
          </div>
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  {...register("name", {
                    required: "Full name is required",
                  })}
                  className={`block w-full pl-11 pr-4 py-3 bg-base-200/50 border ${
                    errors.name ? "border-error" : "border-base-300"
                  } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base-content`}
                  placeholder="Enter your full name"
                  type="text"
                />
              </div>
              {errors.name && (
                <p className="text-error text-xs mt-1 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider">
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
                  className={`block w-full pl-11 pr-4 py-3 bg-base-200/50 border ${
                    errors.email ? "border-error" : "border-base-300"
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
              <label className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider">
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
                  className={`block w-full pl-11 pr-12 py-3 bg-base-200/50 border ${
                    errors.password ? "border-error" : "border-base-300"
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
              <p className="mt-2 text-xs text-base-content/50">
                Minimum 8 characters with a mix of letters and numbers.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-base-content/70 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  {...register("confirm_password", {
                    required: "Confirming password is required",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className={`block w-full pl-11 pr-12 py-3 bg-base-200/50 border ${
                    errors.confirm_password ? "border-error" : "border-base-300"
                  } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base-content`}
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-error text-xs mt-1 font-medium">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
            <div className="pt-2">
              <button
                className="w-full bg-primary text-primary-content font-semibold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <SocialLogin />
          </div>
          <div className="mt-8 pt-8 border-t border-base-200 text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link
                className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
                href="/login"
              >
                Log in
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md w-full bg-base-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-base-200 p-8 md:p-10 flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
