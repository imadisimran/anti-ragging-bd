"use client";
import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { sendVerificationEmail } from "@/actions/server/email";
import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const [sending,setSending]=useState(false)
    const [sent,setSent]=useState(false)
    const router=useRouter()
    const handleEmailSent=async()=>{
        setSending(true)
        const result = await sendVerificationEmail()
        if(result?.success){
            setSent(true)
            Swal.fire({
                title:"Email sent successfully",
                text: result?.message,
                icon:"success",
                // timer: 2000,
                showConfirmButton: true
            })
            router.push("/")
        }else{
            Swal.fire({
                title:"Email not sent",
                text:result?.message || "Something went wrong",
                icon:"error"
            })
        }
        setSending(false)

    }
  return (
    <div className="max-w-md w-full">
      {/* Verify Email Card */}
      <div className="bg-base-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-base-200 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center">
            {/* Icon Header */}
            <div className="relative inline-flex mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full border-4 border-base-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-success-content" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-base-content mb-3 tracking-tight">
              Verify your email
            </h1>
            <p className="text-base-content/60 mb-8 leading-relaxed">
              We've sent a verification link to your email address. Please click the link to confirm your account and get started.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button onClick={handleEmailSent} className={`w-full bg-primary text-primary-content font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 hover:-translate-y-px active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer ${sending ? "opacity-50 cursor-not-allowed" : ""}`}>
                {sending ? <><RefreshCw className="w-4 h-4 animate-spin" />Sending...</> : <>Verify Email <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                
              </button>

              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="w-full py-4 rounded-xl font-semibold text-base-content/70 hover:bg-base-200 hover:text-base-content transition-all flex items-center justify-center cursor-pointer"
                >
                  Skip for now
                </Link>
                
                <button className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <RefreshCw className="w-4 h-4" />
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="bg-base-200/50 p-6 text-center border-t border-base-200">
          <p className="text-xs text-base-content/50">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>

      {/* Trust Badge (consistent with login) */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-base-content" />
          <span className="text-xs font-semibold text-base-content uppercase tracking-wider">
            Secure Platform
          </span>
        </div>
      </div>
    </div>
  );
}
