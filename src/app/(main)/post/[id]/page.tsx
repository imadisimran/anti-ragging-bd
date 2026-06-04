import React from 'react'
import Link from 'next/link'
import { getDetailsReport } from "@/actions/server/report"
import {
  ArrowLeft,
  Info,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
  Type,
  FileText,
  Paperclip,
  Shield,
  Brain,
  AlertTriangle,
  Lock,
  ExternalLink
} from "lucide-react"

export default async function PostDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const response = await getDetailsReport(id)

  if (!response.success || !response.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto my-12 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-headline-sm font-bold text-red-700">Report Not Found</h3>
        <p className="text-body-md text-red-600 mt-1 max-w-md">
          {response.error || "The requested report could not be found or has been deleted."}
        </p>
        <Link href="/" className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg text-label-md hover:bg-opacity-90 active:scale-95 transition-all">
          Go Back to Home Feed
        </Link>
      </div>
    )
  }

  const data = response.data

  // Severity progress bar helper
  const getSeverityConfig = (severity: string) => {
    const s = severity?.toUpperCase() || "LOW";
    switch (s) {
      case "HIGH":
        return {
          width: "85%",
          colorClass: "bg-error text-error",
          label: "HIGH"
        };
      case "MEDIUM":
        return {
          width: "50%",
          colorClass: "bg-warning text-warning",
          label: "MEDIUM"
        };
      case "LOW":
      default:
        return {
          width: "15%",
          colorClass: "bg-secondary text-secondary",
          label: "LOW"
        };
    }
  }

  // Status badge configuration helper
  const getStatusBadgeConfig = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    switch (s) {
      case "REJECTED":
        return {
          bgClass: "bg-error-container text-on-error-container border border-error/20",
          label: "[REJECTED]",
          icon: <ShieldAlert className="w-[18px] h-[18px] text-error" />
        };
      case "APPROVED":
      case "RESOLVED":
      case "VERIFIED":
        return {
          bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          label: `[${s}]`,
          icon: <ShieldCheck className="w-[18px] h-[18px] text-emerald-600" />
        };
      case "PENDING":
      default:
        return {
          bgClass: "bg-amber-50 text-amber-700 border-amber-200/50",
          label: `[${s}]`,
          icon: <Info className="w-[18px] h-[18px] text-amber-600" />
        };
    }
  }

  const severityConfig = getSeverityConfig(data.detectedSeverity)
  const statusBadge = getStatusBadgeConfig(data.status)

  const formatYYYYMMDD = (dateVal: Date | string | number) => {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="max-w-container-max mx-auto p-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Central Feed (Fluid Column) */}
      <div className="lg:col-span-8 space-y-stack-lg">
        {/* Action Bar Top */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-label-md font-label-md">Go Back to Feed</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-label-sm font-label-sm text-outline">Ref: {data.postId}</span>
            <span className="cursor-help flex items-center justify-center" title="Cryptographically unique identifier">
              <Info className="w-[18px] h-[18px] text-outline" />
            </span>
          </div>
        </div>

        {/* Case Header */}
        <section className="bg-surface-container-lowest border border-outline-variant p-8 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 right-0 p-4">
            <div className={`px-3 py-1 flex items-center gap-2 border rounded ${statusBadge.bgClass}`}>
              {statusBadge.icon}
              <span className="font-label-md text-label-md uppercase font-bold">{statusBadge.label}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-headline-lg text-headline-lg text-primary max-w-[80%]">{data.university}</h1>
            <div className="flex flex-wrap gap-6 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-outline" />
                <span className="text-body-md font-body-md">Post ID: {data.postId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-outline" />
                <span className="text-body-md font-body-md">Status: {data.status}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sanitized Title Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Sanitized Title</h3>
            <Type className="w-5 h-5 text-outline" />
          </div>
          <div className="p-8">
            <h2 className="text-headline-md font-headline-md text-primary">{data.title}</h2>
          </div>
        </section>

        {/* Sanitized Description Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Sanitized Description</h3>
            <FileText className="w-5 h-5 text-outline" />
          </div>
          <div className="p-8">
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 italic text-on-surface font-body-lg text-body-lg leading-loose rounded-lg">
              "{data.description}"
            </div>
          </div>
        </section>

        {/* Proof / Evidence Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Proof / Evidence</h3>
            <Paperclip className="w-5 h-5 text-outline" />
          </div>
          {data.proofUrls && data.proofUrls.length > 0 ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.proofUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high transition-colors rounded-lg group"
                >
                  <Paperclip className="w-5 h-5 text-secondary" />
                  <span className="text-body-md font-medium truncate flex-1 text-primary">Evidence File #{index + 1}</span>
                  <ExternalLink className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-dashed border-2 border-outline-variant/30 m-4 rounded-lg">
              <p className="text-body-md font-body-md text-outline italic">No files attached</p>
            </div>
          )}
        </section>

        {/* Action Bar Bottom */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/"
            className="flex-1 md:flex-none px-8 py-3 bg-surface-container-lowest text-primary border border-outline font-label-md text-label-md hover:bg-surface-container-low transition-all text-center rounded"
          >
            Back to Ledger
          </Link>
        </div>

        {/* Security Footnote */}
        <div className="pt-12 pb-8 border-t border-outline-variant flex gap-4 opacity-60">
          <Lock className="w-6 h-6 text-outline shrink-0" />
          <p className="text-label-sm font-label-sm max-w-2xl">
            This report is stored in an encrypted ledger. Institutional safety protocols guarantee absolute anonymity for the whistleblower. All AI rejections are subject to manual audit upon request to ensure fairness and accuracy. Encrypted with AES-256 standards.
          </p>
        </div>
      </div>

      {/* Right Detail Panel (Fixed Column) */}
      <div className="lg:col-span-4 space-y-stack-lg">
        <div className="bg-surface-container-lowest border border-outline-variant divide-y divide-outline-variant rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          {/* Metadata Header */}
          <div className="p-6 bg-surface-container-low">
            <h3 className="font-headline-sm text-headline-sm text-primary">Metadata Snapshot</h3>
          </div>
          {/* Specific Location */}
          <div className="p-6 space-y-1">
            <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">Specific Location</label>
            <p className="text-body-md font-body-md text-primary font-semibold">{data.specificLocation}</p>
          </div>
          {/* Occurrence Date/Time */}
          <div className="p-6 space-y-1">
            <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">Occurrence Date/Time</label>
            <p className="text-body-md font-body-md text-primary font-semibold">{formatYYYYMMDD(data.dateTime)}</p>
          </div>
          {/* Created At */}
          <div className="p-6 space-y-1">
            <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">Created At</label>
            <p className="text-body-md font-body-md text-primary font-semibold">{formatYYYYMMDD(data.createdAt)}</p>
          </div>
          {/* Harassment Type */}
          <div className="p-6 flex justify-between items-center">
            <div className="space-y-1">
              <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">Harassment Type</label>
              <p className="text-body-md font-body-md text-primary font-semibold">{data.harassmentType}</p>
            </div>
            <Brain className="w-10 h-10 p-2 bg-surface-container-low text-primary rounded-lg" />
          </div>
          {/* Severity */}
          <div className="p-6 space-y-3">
            <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">Detected Severity</label>
            <div className="flex items-center gap-4">
              <div className="h-2 flex-1 bg-surface-container-high overflow-hidden rounded-full">
                <div className={`h-full ${severityConfig.colorClass.split(' ')[0]}`} style={{ width: severityConfig.width }}></div>
              </div>
              <span className={`text-headline-sm font-headline-sm ${severityConfig.colorClass.split(' ')[1]}`}>{severityConfig.label}</span>
            </div>
          </div>
          {/* User ID */}
          <div className="p-6 space-y-1">
            <label className="text-label-sm font-label-sm text-outline uppercase tracking-widest">User ID</label>
            <p className="text-body-md font-body-md text-primary font-mono break-all text-xs">{data.userId}</p>
          </div>
        </div>
      </div>

      {/* Contextual Toast Notification */}
      <div className="fixed bottom-margin-desktop right-margin-desktop bg-primary text-on-primary px-6 py-4 shadow-xl transition-transform duration-300 flex items-center gap-3 z-[60] translate-y-20" id="toast">
        <Info className="w-5 h-5 text-white" />
        <span className="text-label-md font-label-md">Viewing Case #{data.postId} - Read Only Mode</span>
      </div>
    </div>
  )
}
