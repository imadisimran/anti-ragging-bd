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
  captchaAnswer: string;
}

export default function ReportPage() {
  const { register, handleSubmit, control,setValue } = useForm<ReportFormInputs>({
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


  const onSubmit = (data: ReportFormInputs) => {
    // No functionality needed right now, purely focus on UI/design.
    console.log("Form Data Submitted:", data);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12" id="reportingForm">

        {/* Section 1: Incident Information */}
        <div className="form-section-active space-y-stack-lg" id="section-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary text-label-sm font-bold">
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
                  onChange: () => {
                    setValue("locationCategory", "");
                    setValue("specificLocation", "");
                  }
                })}
                className="report-select"
              >
                <option value="">Select Institution</option>
                <option value="University of Dhaka">University of Dhaka</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Date and Time</label>
              <input
                type="datetime-local"
                {...register("dateTime")}
                className="report-select"
              />
            </div>

            {/* Harassment Type */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Harassment Type</label>
              <select
                {...register("harassmentType")}
                className="report-select"
              >
                <option value="">Select Type</option>
                <option value="physical">Physical Ragging</option>
                <option value="mental">Mental Harassment</option>
                <option value="cyber">Cyber Bullying</option>
                <option value="sexual">Sexual Harassment</option>
                <option value="political">Forced Political Participation</option>
              </select>
            </div>

            {/* Location Category */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Location Category</label>
              <select
                {...register("locationCategory")}
                className="report-select"
                disabled={!university}
              >
                <option value="" disabled>{university ? "Select Category" : "Select University First"}</option>
                <option value="hall">Residential Hall</option>
                <option value="hostel">Hostel</option>
                <option value="institute">Institute</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Specific Location Name */}
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface">Select Specific Location</label>
              <select
                {...register("specificLocation")}
                className="report-select"
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
            </div>
          </div>
        </div>

        {/* Section 2: Narrative Entry */}
        <div className="space-y-stack-lg border-l-4 border-outline-variant/30 pl-6" id="section-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-outline-variant text-on-surface text-label-sm font-bold">
              2
            </span>
            <h2 className="text-headline-sm text-primary font-bold">Narrative Entry</h2>
          </div>
          <div className="space-y-2">
            <label className="text-label-md font-bold text-on-surface">Detailed Account of Incident</label>
            <textarea
              rows={6}
              {...register("narrative")}
              placeholder="Describe the event with as much detail as possible. Avoid mentioning your own name if you wish to remain fully anonymous."
              className="w-full p-4 bg-white border border-outline-variant rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-body-md resize-none transition-all text-on-surface"
            />
            <p className="text-[11px] text-on-surface-variant font-medium">
              Character limit: 5000. All text is encrypted client-side before transmission.
            </p>
          </div>
        </div>

        {/* Section 3: Proof & Documentation */}
        <div className="space-y-stack-lg border-l-4 border-outline-variant/30 pl-6" id="section-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-outline-variant text-on-surface text-label-sm font-bold">
              3
            </span>
            <h2 className="text-headline-sm text-primary font-bold">Proof & Documentation</h2>
          </div>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group">
              <CloudUpload className="w-12 h-12 text-outline group-hover:text-secondary transition-colors" />
              <p className="mt-4 text-label-md font-bold text-on-surface">Drag and drop files here</p>
              <p className="text-body-md text-on-surface-variant">or click to browse from your device</p>
              <p className="mt-2 text-[11px] text-on-surface-variant font-medium">
                Supports Images, Audio, and Video files
              </p>
              <input
                type="file"
                multiple
                {...register("proofFiles")}
                className="hidden"
              />
            </div>
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
