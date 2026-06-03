"use client";
import { verifyToken } from "@/actions/server/auth";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, Suspense } from "react";
import Swal from "sweetalert2";
import { Loader2, XCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("");
  const { update, status: sessionStatus } = useSession();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    const handleVerify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      const res = await verifyToken(token);
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
        Swal.fire({
          title: "Email Verified!",
          text: res.message,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        // console.log("update triggered");
        await update({ force: true });
        router.refresh();
        router.push("/");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    };

    handleVerify();
  }, [token, router, sessionStatus, update]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-base-100 rounded-2xl shadow-xl border border-base-200 max-w-md w-full mx-auto">
      {status === "verifying" && (
        <div className="space-y-6 py-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Loader2 className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-base-content">
              Verifying Email
            </h2>
            <p className="text-base-content/60">
              Please wait while we secure your account...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6 py-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-success">Verified!</h2>
            <p className="text-base-content/60">{message}</p>
            <p className="text-sm font-medium text-primary mt-4">
              Redirecting you to home page...
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6 py-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-error" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-error">
              Verification Failed
            </h2>
            <p className="text-base-content/60">
              {message || "We couldn't verify your email at this time."}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/verify-email"
              className="btn btn-primary btn-md gap-2 rounded-xl"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Link>
            <Link
              href="/"
              className="btn btn-ghost btn-sm text-base-content/50"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
