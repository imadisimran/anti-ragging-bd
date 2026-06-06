"use client";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CloudUpload, X, ShieldAlert, AlertTriangle, UserCheck, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { aiVerification, getLocation, postReport } from "@/actions/server/reportForm";

interface ReportFormInputs {
  university: string;
  dateTime: string;
  harassmentType: string;
  locationCategory: string;
  specificLocation: string;
  narrative: string;
  proofFiles: FileList;
}

export default function ReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ReportFormInputs>({
    defaultValues: {
      locationCategory: "",
      specificLocation: ""
    }
  });

  const locationCategory = useWatch({ name: "locationCategory", control })
  const university = useWatch({ name: "university", control })

  const [specificLocations, setSpecificLocations] = useState<string[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string; type: string }[]>([]);
  const watchedFiles = useWatch({ name: "proofFiles", control });

  useEffect(() => {
    if (!watchedFiles || watchedFiles.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = Array.from(watchedFiles).map((file) => {
      return {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      };
    });

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [watchedFiles]);

  const removeFile = (indexToRemove: number) => {
    if (!watchedFiles) return;
    const dt = new DataTransfer();
    Array.from(watchedFiles).forEach((file, index) => {
      if (index !== indexToRemove) {
        dt.items.add(file);
      }
    });
    setValue("proofFiles", dt.files, { shouldValidate: true });
  };

  useEffect(() => {
    if (!university || !locationCategory) {
      setSpecificLocations([]);
      return;
    }

    let active = true;
    getLocation(university, locationCategory).then((data) => {
      if (active && data) {
        const categoryData = data[locationCategory];
        if (Array.isArray(categoryData)) {
          setSpecificLocations(categoryData);
        } else {
          setSpecificLocations([]);
        }
      } else if (active) {
        setSpecificLocations([]);
      }
    });

    return () => {
      active = false;
    };
  }, [university, locationCategory]);


  const handlePostReport = async (data: ReportFormInputs) => {
    try {
      Swal.fire({
        title: "Submitting...",
        text: "Encrypting narrative and uploading proof files, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formData = new FormData();
      formData.append("university", data.university);
      formData.append("dateTime", new Date(data.dateTime).toISOString());
      formData.append("harassmentType", data.harassmentType);
      formData.append("locationCategory", data.locationCategory);
      formData.append("specificLocation", data.specificLocation);
      formData.append("narrative", data.narrative);

      if (data.proofFiles) {
        Array.from(data.proofFiles).forEach((file) => {
          formData.append("proofFiles", file);
        });
      }

      const result = await postReport(formData);

      if (result.success) {
        Swal.fire({
          title: "SUCCESSFUL",
          text: "Your anonymous report has been successfully encrypted and submitted.",
          icon: "success",
          confirmButtonColor: "var(--color-primary, #000000)"
        }).then(() => {
          router.push("/dashboard/my-posts");
        });
      } else {
        Swal.fire({
          title: "FAILED",
          text: result.message || "Failed to submit report.",
          icon: "error",
          confirmButtonColor: "var(--color-primary, #000000)"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "ERROR",
        text: "An unexpected error occurred.",
        icon: "error",
        confirmButtonColor: "var(--color-primary, #000000)"
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-on-surface-variant font-body-lg">Verifying session details...</p>
      </div>
    );
  }

  const isProfileComplete = session?.user?.isProfileComplete;
  const isVerified = session?.user?.isVerified;

  if (!isProfileComplete || !isVerified) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4">
        {/* Warning Panel */}
        <div className="bg-white rounded-2xl border border-outline-variant shadow-xl overflow-hidden relative transition-all duration-300 hover:shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-error via-warning to-secondary"></div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 text-error">
              <div className="bg-error-container/40 p-3 rounded-2xl text-error shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-headline-lg font-bold text-primary">Submission Blocked</h2>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Institutional policy requires a complete and verified profile before you can file ragging reports.
                </p>
              </div>
            </div>

            <div className="divider opacity-50 my-2"></div>

            {/* Prerequisites Status List */}
            <div className="space-y-4">
              <h3 className="text-label-sm font-bold text-outline uppercase tracking-wider">Verification Checklist</h3>

              {/* Prerequisite 1: Institutional Profile */}
              <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${isProfileComplete
                ? "bg-success/5 border-success/20 text-success"
                : "bg-error/5 border-error/20 text-error"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isProfileComplete ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {isProfileComplete ? <UserCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`text-label-md font-bold ${isProfileComplete ? "text-success" : "text-primary"}`}>Institutional Profile Details</h4>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {isProfileComplete
                        ? "Your university, department, session, and residential details are complete."
                        : "University, department, session, or residential information is missing."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-white shadow-sm border border-outline-variant/30">
                  {isProfileComplete ? "Complete" : "Incomplete"}
                </div>
              </div>

              {/* Prerequisite 2: Email Verification */}
              <div className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${isVerified
                ? "bg-success/5 border-success/20 text-success"
                : "bg-error/5 border-error/20 text-error"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isVerified ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {isVerified ? <UserCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`text-label-md font-bold ${isVerified ? "text-success" : "text-primary"}`}>Identity Verification</h4>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {isVerified
                        ? "Your institutional email has been successfully verified."
                        : "Your email is unverified. Verification is required to confirm student status."}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-white shadow-sm border border-outline-variant/30">
                  {isVerified ? "Verified" : "Unverified"}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-outline-variant/50 rounded-xl p-4 text-body-sm text-on-surface-variant leading-relaxed">
              <strong>Why is this required?</strong> To protect students and ensure the high credibility of anonymous filings, we must cross-reference reports with valid institutional details and verified email hashes. Your identity is still fully encrypted and anonymized during report submission.
            </div>

            {/* Redirection Button */}
            <div className="flex justify-end pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => router.push("/dashboard/profile")}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label-md font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer hover:shadow-lg animate-bounce-short"
              >
                <span>Complete Profile Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Anonymous Reporting Wizard</h1>
        <p className="text-body-md text-on-surface-variant">
          Submit a secure, encrypted report. Your identity remains protected by institutional-grade security protocols.
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit(handlePostReport)} className="space-y-12" id="reportingForm">

        {/* Section 1: Incident Information */}
        <div className="group space-y-stack-lg border-l-4 border-outline-variant/30 focus-within:border-primary pl-6 transition-colors" id="section-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-outline-variant text-on-surface text-label-sm font-bold group-focus-within:bg-primary group-focus-within:text-on-primary transition-colors">
              1
            </span>
            <h2 className="text-headline-sm text-primary font-bold">Incident Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* University Selection */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">University Selection</label>
              <select
                {...register("university", {
                  required: "University is required",
                  onChange: () => {
                    setValue("locationCategory", "");
                    setValue("specificLocation", "");
                  }
                })}
                className={`report-select ${errors.university ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
              >
                <option value="">Select Institution</option>
                <option value="University of Dhaka">University of Dhaka</option>
              </select>
              {errors.university && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.university.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Date and Time</label>
              <input
                type="datetime-local"
                {...register("dateTime", { required: "Date and Time is required" })}
                className={`report-select ${errors.dateTime ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
              />
              {errors.dateTime && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.dateTime.message}</p>
              )}
            </div>

            {/* Harassment Type */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Harassment Type</label>
              <select
                {...register("harassmentType", { required: "Harassment Type is required" })}
                className={`report-select ${errors.harassmentType ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
              >
                <option value="">Select Type</option>
                <option value="physical">Physical Ragging</option>
                <option value="mental">Mental Harassment</option>
                <option value="cyber">Cyber Bullying</option>
                <option value="sexual">Sexual Harassment</option>
                <option value="political">Forced Political Participation</option>
              </select>
              {errors.harassmentType && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.harassmentType.message}</p>
              )}
            </div>

            {/* Location Category */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Location Category</label>
              <select
                {...register("locationCategory", { required: "Location Category is required" })}
                className={`report-select ${errors.locationCategory ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
                disabled={!university}
              >
                <option value="" disabled>{university ? "Select Category" : "Select University First"}</option>
                <option value="hall">Residential Hall</option>
                <option value="hostel">Hostel</option>
                <option value="institute">Institute</option>
                <option value="department">Department</option>
              </select>
              {errors.locationCategory && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.locationCategory.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Specific Location Name */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Select Specific Location</label>
              <select
                {...register("specificLocation", { required: "Specific Location is required" })}
                className={`report-select ${errors.specificLocation ? "border-error focus:ring-error/20 focus:border-error" : ""}`}
                disabled={!university || !locationCategory}
              >
                <option value="" disabled>
                  {!university
                    ? "Select University First"
                    : locationCategory
                      ? `Select ${locationCategory}`
                      : "Select Category First"}
                </option>
                {specificLocations.map((l, i) => (
                  <option value={l} key={i}>
                    {l}
                  </option>
                ))}
              </select>
              {errors.specificLocation && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.specificLocation.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Narrative Entry */}
        <div className="group space-y-stack-lg border-l-4 border-outline-variant/30 focus-within:border-primary pl-6 transition-colors" id="section-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-outline-variant text-on-surface text-label-sm font-bold group-focus-within:bg-primary group-focus-within:text-on-primary transition-colors">
              2
            </span>
            <h2 className="text-headline-sm text-primary font-bold">Narrative Entry</h2>
          </div>
          <div className="space-y-2">
            <label className="text-label-md font-bold text-on-surface">Detailed Account of Incident</label>
            <textarea
              rows={6}
              {...register("narrative", { required: "Detailed account is required" })}
              placeholder="Describe the event with as much detail as possible. Avoid mentioning your own name if you wish to remain fully anonymous."
              className={`w-full p-4 bg-white border rounded-md focus:ring-2 outline-none text-body-md resize-none transition-all text-on-surface ${errors.narrative
                ? "border-error focus:ring-error/20 focus:border-error"
                : "border-outline-variant focus:ring-secondary/20 focus:border-secondary"
                }`}
            />
            {errors.narrative && (
              <p className="text-[11px] text-error font-medium mt-1">{errors.narrative.message}</p>
            )}
            <p className="text-[11px] text-on-surface-variant font-medium">
              Character limit: 5000. All text is encrypted client-side before transmission.
            </p>
          </div>
        </div>

        {/* Section 3: Proof & Documentation */}
        <div className="group space-y-stack-lg border-l-4 border-outline-variant/30 focus-within:border-primary pl-6 transition-colors" id="section-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-outline-variant text-on-surface text-label-sm font-bold group-focus-within:bg-primary group-focus-within:text-on-primary transition-colors">
              3
            </span>
            <h2 className="text-headline-sm text-primary font-bold">Proof & Documentation</h2>
          </div>
          <div className="space-y-4">
            <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container focus-within:ring-2 outline-none transition-all cursor-pointer group ${errors.proofFiles
              ? "border-error focus-within:ring-error/20 focus-within:border-error"
              : "border-outline-variant focus-within:border-secondary focus-within:ring-secondary/20"
              }`}>
              <CloudUpload className="w-12 h-12 text-outline group-hover:text-secondary transition-colors" />
              <p className="mt-4 text-label-md font-bold text-on-surface">Drag and drop files here</p>
              <p className="text-body-md text-on-surface-variant">or click to browse from your device</p>
              <p className="mt-2 text-[11px] text-on-surface-variant font-medium">
                Supports Images, Audio, and Video files
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                {...register("proofFiles", {
                  validate: (fileList) => {
                    if (!fileList || fileList.length === 0) return true;
                    const allowedTypes = ["image/", "video/", "audio/"];
                    for (let i = 0; i < fileList.length; i++) {
                      const file = fileList[i];
                      const isValid = allowedTypes.some((type) => file.type.startsWith(type));
                      if (!isValid) {
                        return "Only image, video, and audio files are allowed";
                      }
                    }
                    return true;
                  }
                })}
                className="sr-only"
              />
            </label>
            {errors.proofFiles && (
              <p className="text-[11px] text-error font-medium mt-1">{errors.proofFiles.message}</p>
            )}
            {previews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previews.map((preview, index) => {
                  const isImage = preview.type.startsWith("image/");
                  const isVideo = preview.type.startsWith("video/");
                  const isAudio = preview.type.startsWith("audio/");

                  return (
                    <div key={index} className="relative group/preview border border-outline-variant/50 rounded-xl p-3 bg-surface-container-low flex flex-col gap-2 shadow-sm hover:shadow-md transition-all">
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 z-10 p-1 bg-surface-container-highest/80 hover:bg-error hover:text-on-error text-on-surface rounded-full shadow-sm transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-container-highest flex items-center justify-center relative">
                        {isImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                        )}
                        {isVideo && (
                          <video src={preview.url} className="w-full h-full object-cover" controls />
                        )}
                        {isAudio && (
                          <div className="flex flex-col items-center justify-center p-4 w-full h-full gap-2">
                            <span className="text-3xl">🎵</span>
                            <audio src={preview.url} controls className="w-full h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-label-sm font-bold text-on-surface truncate" title={preview.name}>
                          {preview.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant uppercase font-medium">
                          {preview.type.split("/")[0] || "file"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-on-surface-variant italic">
              All uploaded files are automatically sanitized to remove metadata before encryption.
            </p>
          </div>
        </div>

        {/* Submit Container */}
        <div className="flex justify-end pt-stack-lg border-t border-outline-variant">
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-on-primary font-label-md font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Submit Report
          </button>
        </div>

      </form>
    </div>
  );
}
