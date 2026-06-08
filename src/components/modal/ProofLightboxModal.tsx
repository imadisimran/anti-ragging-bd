import React, { useEffect } from "react";
import { X, Clock } from "lucide-react";

interface ProofLightboxModalProps {
  isOpen: boolean;
  proofUrl: string | null;
  onClose: () => void;
  subText?: string;
}

const getProofType = (url: string): "image" | "video" | "audio" | "unknown" => {
  const lowercaseUrl = url.toLowerCase();
  if (
    lowercaseUrl.includes("/video/upload/") ||
    lowercaseUrl.endsWith(".mp4") ||
    lowercaseUrl.endsWith(".webm") ||
    lowercaseUrl.endsWith(".ogg") ||
    lowercaseUrl.endsWith(".mov")
  ) {
    return "video";
  }
  if (
    lowercaseUrl.includes("/image/upload/") ||
    lowercaseUrl.endsWith(".jpg") ||
    lowercaseUrl.endsWith(".jpeg") ||
    lowercaseUrl.endsWith(".png") ||
    lowercaseUrl.endsWith(".webp") ||
    lowercaseUrl.endsWith(".gif")
  ) {
    return "image";
  }
  if (
    lowercaseUrl.includes("/audio/upload/") ||
    lowercaseUrl.endsWith(".mp3") ||
    lowercaseUrl.endsWith(".wav") ||
    lowercaseUrl.endsWith(".aac") ||
    lowercaseUrl.endsWith(".m4a")
  ) {
    return "audio";
  }
  return "unknown";
};

export default function ProofLightboxModal({
  isOpen,
  proofUrl,
  onClose,
  subText,
}: ProofLightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !proofUrl) return null;

  const type = getProofType(proofUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-150">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        title="Close Zoom"
      >
        <X className="w-8 h-8" />
      </button>
      <div className="max-w-5xl w-full max-h-[85vh] relative flex flex-col items-center justify-center">
        {type === "video" ? (
          <video
            src={proofUrl}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg border border-white/10 shadow-2xl"
          />
        ) : type === "audio" ? (
          <div className="bg-slate-900 p-8 rounded-lg border border-white/10 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <Clock className="w-12 h-12 text-white animate-pulse" />
            <audio src={proofUrl} controls autoPlay className="w-80" />
            <span className="text-white text-xs">Audio Evidence Playback</span>
          </div>
        ) : (
          <img
            className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
            alt="Zoomed evidence capture"
            src={proofUrl}
          />
        )}
        {subText && (
          <p className="text-white/60 text-xs font-semibold mt-4 text-center">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}
