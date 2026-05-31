"use client";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CloudUpload } from "lucide-react";
import { getLocation } from "@/actions/server/reportForm";

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
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ReportFormInputs>({
    defaultValues: {
      locationCategory: "",
      specificLocation: ""
    }
  }); 

  const locationCategory = useWatch({ name: "locationCategory", control })
  const university = useWatch({ name: "university", control })

  const [specificLocations, setSpecificLocations] = useState<string[]>([]);

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


  const handlePostReport = (data: ReportFormInputs) => {
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
    
    console.log("Form Data Submitted (entries):", Object.fromEntries(formData.entries()));
  };

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
              className={`w-full p-4 bg-white border rounded-md focus:ring-2 outline-none text-body-md resize-none transition-all text-on-surface ${
                errors.narrative 
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
            <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container focus-within:ring-2 outline-none transition-all cursor-pointer group ${
              errors.proofFiles 
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
