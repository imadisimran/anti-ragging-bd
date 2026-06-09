import React from "react";
import {
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2 as AudioIcon,
  FileText as FileIcon,
  Eye,
} from "lucide-react";
import { getFileInfo, ProofItem } from "@/lib/getFileInfo";
import { ProofUrlType } from "@/types/AdminDashboardTypes";

export interface EvidenceAttachmentListProps {
  proofUrls: ProofUrlType[];
  onSelectProof: (url: string) => void;
  title?: string;
}

export default function EvidenceAttachmentList({
  proofUrls,
  onSelectProof,
  title = "Evidence Attachments",
}: EvidenceAttachmentListProps) {
  const hasProofs = proofUrls && proofUrls.length > 0;

  return (
    <div className="p-4 bg-slate-50 border border-outline-variant rounded-xl space-y-3">
      {/* Component Title Header */}
      <div className="flex items-center gap-2 text-outline text-label-sm font-bold uppercase tracking-wider">
        <Paperclip className="w-4 h-4 text-on-surface-variant" />
        <span>{title}</span>
      </div>

      {hasProofs ? (
        <div className="space-y-3">
          {/* File Count Label */}
          <p className="text-label-md font-bold text-secondary flex items-center gap-1.5">
            <span>{proofUrls.length} {proofUrls.length === 1 ? "File" : "Files"} Attached</span>
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {proofUrls.map((proof, idx) => {
              const secureUrl = typeof proof === "string" ? proof : proof?.secureUrl || "";
              const { type, extension } = getFileInfo(proof);

              // File-type-specific design tokens
              let Icon = FileIcon;
              let iconColorClass = "text-slate-600";
              let iconBgClass = "bg-slate-50 group-hover:bg-slate-100";
              let badgeStyle = "bg-slate-100/80 text-slate-800 border-slate-200/50";

              if (type === "Image") {
                Icon = ImageIcon;
                iconColorClass = "text-emerald-600";
                iconBgClass = "bg-emerald-50 group-hover:bg-emerald-100/70";
                badgeStyle = "bg-emerald-100/80 text-emerald-800 border-emerald-200/50";
              } else if (type === "Video") {
                Icon = VideoIcon;
                iconColorClass = "text-purple-600";
                iconBgClass = "bg-purple-50 group-hover:bg-purple-100/70";
                badgeStyle = "bg-purple-100/80 text-purple-800 border-purple-200/50";
              } else if (type === "Audio") {
                Icon = AudioIcon;
                iconColorClass = "text-amber-600";
                iconBgClass = "bg-amber-50 group-hover:bg-amber-100/70";
                badgeStyle = "bg-amber-100/80 text-amber-800 border-amber-200/50";
              }

              // Human-readable file name
              const fileName = `Proof Attachment 0${idx + 1}`;

              return (
                <div
                  key={secureUrl || idx}
                  onClick={() => secureUrl && onSelectProof(secureUrl)}
                  className="flex items-center gap-2.5 p-2.5 bg-white border border-outline-variant hover:border-primary rounded-xl cursor-pointer transition-all duration-200 hover:shadow-xs group min-w-0 relative overflow-hidden"
                >
                  {/* Left Side: Type Icon */}
                  <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${iconBgClass}`}>
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${iconColorClass}`} />
                  </div>

                  {/* Right Side: Name & Badges Stack */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm text-on-surface truncate group-hover:text-primary transition-colors leading-tight">
                      {fileName}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {extension && (
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/80 rounded-md leading-none">
                          .{extension}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 text-[8px] font-extrabold border rounded-md uppercase tracking-wider ${badgeStyle} leading-none`}>
                        {type}
                      </span>
                    </div>
                  </div>

                  {/* Hover indicator (icon) */}
                  <Eye className="w-3.5 h-3.5 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 hidden md:block mr-0.5" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant italic py-1">No proof provided.</p>
      )}
    </div>
  );
}
