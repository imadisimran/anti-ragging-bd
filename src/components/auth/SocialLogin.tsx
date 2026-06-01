"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const SocialLogin = () => {
  const searchParams = useSearchParams();
  const callBackUrl = searchParams.get("callbackUrl");

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: callBackUrl || "/" });
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="border-t border-base-300 w-full"></div>
        <span className="bg-base-100 px-4 text-xs font-semibold text-base-content/40 uppercase tracking-widest absolute">
          Or continue with
        </span>
      </div>
      <div className="pt-2">
        <button
          onClick={handleGoogleLogin}
          className="btn bg-white hover:bg-gray-50 text-black border-[#e5e5e5] w-full flex items-center justify-center gap-3 h-12 rounded-lg shadow-sm transition-all active:scale-[0.98]"
        >
          <svg
            aria-label="Google logo"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              ></path>
              <path
                fill="#4285f4"
                d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              ></path>
              <path
                fill="#fbbc02"
                d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
              ></path>
              <path
                fill="#ea4335"
                d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              ></path>
            </g>
          </svg>
          <span className="font-medium">Login with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
