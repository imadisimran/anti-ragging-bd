"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Building,
  MapPin,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Loader2,
  ListFilter
} from "lucide-react";
import Swal from "sweetalert2";
import { getUniversitites, getStudyAreas } from "@/actions/server/profile";
import { manageSystemLocations, overrideAppealVerdict } from "@/actions/server/master-admin";
import { getAdminIncidentDetails } from "@/actions/server/admin";

export default function MasterControls() {
  const [activeTab, setActiveTab] = useState<"locations" | "override">("locations");

  // Tab 1: Location Manager State
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedUniv, setSelectedUniv] = useState("");
  const [locationType, setLocationType] = useState<"hall" | "hostel" | "department">("hall");
  const [locationsList, setLocationsList] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Form Inputs
  const [newUnivName, setNewUnivName] = useState("");
  const [newLocName, setNewLocName] = useState("");
  const [submittingLoc, setSubmittingLoc] = useState(false);

  // Tab 2: Override Verdict State
  const [searchPostId, setSearchPostId] = useState("");
  const [searchingReport, setSearchingReport] = useState(false);
  const [foundReport, setFoundReport] = useState<any | null>(null);
  const [overrideAction, setOverrideAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [overrideNote, setOverrideNote] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // Load Universities List
  const loadUniversities = async () => {
    try {
      const res = await getUniversitites();
      if (res.success && res.data) {
        const list = res.data.map((u) => u.university);
        setUniversities(list);
        if (list.length > 0 && !selectedUniv) {
          setSelectedUniv(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load universities:", err);
    }
  };

  // Load Locations when university or locationType changes
  const loadLocations = async () => {
    if (!selectedUniv) return;
    setLoadingLocations(true);
    try {
      const res = await getStudyAreas({ university: selectedUniv, locationType });
      if (res.success && res.data) {
        const raw = res.data as any;
        const list = raw[locationType] || [];
        setLocationsList(list);
      } else {
        setLocationsList([]);
      }
    } catch (err) {
      console.error(err);
      setLocationsList([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    loadLocations();
  }, [selectedUniv, locationType]);

  // Add University
  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnivName.trim()) return;
    setSubmittingLoc(true);
    try {
      const res = await manageSystemLocations("add", "university", { university: newUnivName.trim() });
      if (res.success) {
        Swal.fire("Added", `University "${newUnivName.trim()}" added.`, "success");
        setNewUnivName("");
        await loadUniversities();
      } else {
        Swal.fire("Error", res.error || "Failed to add university.", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "An error occurred.", "error");
    } finally {
      setSubmittingLoc(false);
    }
  };

  // Remove University
  const handleRemoveUniversity = async (univName: string) => {
    const result = await Swal.fire({
      title: "Remove University?",
      text: `Are you sure you want to delete university "${univName}"? This will delete all its residential halls, hostels, and departments too.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      setLoadingLocations(true);
      try {
        const res = await manageSystemLocations("remove", "university", { university: univName });
        if (res.success) {
          Swal.fire("Removed", `University "${univName}" deleted.`, "success");
          setSelectedUniv("");
          await loadUniversities();
        } else {
          Swal.fire("Error", res.error || "Failed to remove university.", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err.message || "An error occurred.", "error");
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  // Add Hall/Hostel/Department
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniv || !newLocName.trim()) return;
    setSubmittingLoc(true);
    try {
      const res = await manageSystemLocations("add", locationType, {
        university: selectedUniv,
        name: newLocName.trim()
      });
      if (res.success) {
        Swal.fire("Added", `Successfully added ${locationType} "${newLocName.trim()}".`, "success");
        setNewLocName("");
        await loadLocations();
      } else {
        Swal.fire("Error", res.error || "Failed to add location.", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "An error occurred.", "error");
    } finally {
      setSubmittingLoc(false);
    }
  };

  // Remove Hall/Hostel/Department
  const handleRemoveLocation = async (locName: string) => {
    const result = await Swal.fire({
      title: `Remove ${locationType}?`,
      text: `Are you sure you want to delete "${locName}" from ${selectedUniv}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      setLoadingLocations(true);
      try {
        const res = await manageSystemLocations("remove", locationType, {
          university: selectedUniv,
          name: locName
        });
        if (res.success) {
          Swal.fire("Removed", `Deleted "${locName}" successfully.`, "success");
          await loadLocations();
        } else {
          Swal.fire("Error", res.error || "Failed to remove location.", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err.message || "An error occurred.", "error");
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  // Tab 2: Find Case Report
  const handleSearchReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPostId.trim()) return;
    setSearchingReport(true);
    setFoundReport(null);
    try {
      const res = await getAdminIncidentDetails(searchPostId.trim());
      if (res.success && res.data) {
        setFoundReport(res.data);
        // Pre-fill fields
        setOverrideAction(res.data.adminVerification?.status === "REJECTED" ? "REJECT" : "APPROVE");
        setOverrideNote(res.data.adminVerification?.adminNote || "");
      } else {
        Swal.fire("Not Found", res.error || "No report found with the given Case ID reference.", "warning");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to search report details.", "error");
    } finally {
      setSearchingReport(false);
    }
  };

  // Tab 2: Submit Override Verdict
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundReport) return;
    if (!overrideNote.trim()) {
      Swal.fire("Explanation Required", "Please write an override explanation summary note.", "warning");
      return;
    }

    setSubmittingOverride(true);
    try {
      const res = await overrideAppealVerdict(foundReport.postId, overrideAction, overrideNote.trim());
      if (res.success) {
        Swal.fire("Verdict Overridden", res.message || "Verdict overridden successfully.", "success");
        // Reload details
        const updateRes = await getAdminIncidentDetails(foundReport.postId);
        if (updateRes.success) setFoundReport(updateRes.data);
      } else {
        Swal.fire("Failed", res.error || "Failed to override verdict.", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "An error occurred.", "error");
    } finally {
      setSubmittingOverride(false);
    }
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-stack-lg">
        <h1 className="text-display text-primary mb-2">Master Controls</h1>
        <p className="text-body-md text-on-surface-variant">
          Supreme authority dashboard to configure institutional parameters and override moderation decisions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant pb-2 bg-slate-50 p-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab("locations")}
          className={`px-4 py-2 text-label-sm font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "locations" ? "bg-slate-900 text-white" : "text-on-surface-variant hover:bg-slate-200"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Location Manager</span>
        </button>
        <button
          onClick={() => setActiveTab("override")}
          className={`px-4 py-2 text-label-sm font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "override" ? "bg-slate-900 text-white" : "text-on-surface-variant hover:bg-slate-200"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Override Verdicts</span>
        </button>
      </div>

      {/* Tab Contents: Locations */}
      {activeTab === "locations" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start">
          {/* Universities list */}
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-headline-xs font-bold text-primary flex items-center gap-1.5">
                <Building className="w-5 h-5 text-primary" />
                <span>Universities</span>
              </h3>
              <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-outline font-mono">
                {universities.length} total
              </span>
            </div>

            {/* Add Univ Form */}
            <form onSubmit={handleAddUniversity} className="flex gap-2">
              <input
                type="text"
                required
                value={newUnivName}
                onChange={(e) => setNewUnivName(e.target.value)}
                placeholder="E.g., Dhaka University"
                className="flex-1 px-3 py-1.5 border border-outline-variant text-body-sm rounded-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
              <button
                type="submit"
                disabled={submittingLoc}
                className="bg-primary text-on-primary hover:bg-opacity-95 p-2 rounded transition-all cursor-pointer flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* List */}
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {universities.map((univ) => (
                <div
                  key={univ}
                  onClick={() => setSelectedUniv(univ)}
                  className={`flex justify-between items-center p-3 rounded-lg border text-body-sm font-semibold transition-all cursor-pointer ${
                    selectedUniv === univ
                      ? "bg-primary-container/10 border-primary text-primary"
                      : "bg-slate-50 border-outline-variant/65 text-on-surface hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{univ}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUniversity(univ);
                    }}
                    className="p-1 hover:bg-red-50 text-red-600 hover:text-red-700 rounded transition-colors cursor-pointer"
                    title="Delete University"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations inside University (Halls/Hostels/Departments) */}
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4 md:col-span-2 flex flex-col min-h-[450px]">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
              <div>
                <h3 className="text-headline-xs font-bold text-primary">
                  {selectedUniv ? `${selectedUniv} Jurisdiction Options` : "Select University First"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Configure sub-locations and departments</p>
              </div>

              {/* Type selector tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                {(["hall", "hostel", "department"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocationType(t)}
                    className={`px-3 py-1 text-xs font-bold rounded capitalize cursor-pointer transition-all ${
                      locationType === t ? "bg-white text-primary shadow-xs" : "text-outline hover:text-on-surface"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {selectedUniv ? (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Add Sub Location Form */}
                <form onSubmit={handleAddLocation} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    placeholder={`Add new ${locationType} name (e.g. Masterda Surja Sen Hall)...`}
                    className="flex-1 px-3 py-2 border border-outline-variant text-body-md rounded-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                  <button
                    type="submit"
                    disabled={submittingLoc}
                    className="bg-primary text-on-primary hover:bg-opacity-95 px-4 py-2 rounded text-label-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {locationType}</span>
                  </button>
                </form>

                {/* Sub Locations List Grid */}
                <div className="flex-1 relative">
                  {loadingLocations ? (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs text-outline font-bold">Updating locations...</span>
                    </div>
                  ) : locationsList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {locationsList.map((loc) => (
                        <div
                          key={loc}
                          className="p-3 bg-slate-50 border border-outline-variant/60 rounded-lg flex justify-between items-center text-body-md font-medium text-on-surface transition-all hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-4 h-4 text-outline flex-shrink-0" />
                            <span className="truncate">{loc}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveLocation(loc)}
                            className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors cursor-pointer"
                            title={`Delete ${locationType}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant/50">
                      <MapPin className="w-8 h-8 text-on-surface-variant/30 mb-2 animate-bounce" />
                      <p className="font-bold">No {locationType}s configured.</p>
                      <p className="text-xs">Add a dynamic location to enable authority scoping.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant/50 border border-dashed border-outline-variant rounded-xl">
                <ListFilter className="w-10 h-10 text-on-surface-variant/30 mb-2" />
                <p className="font-bold">Jurisdiction Options Offline</p>
                <p className="text-xs">Select a university from the left sidebar to add/remove sub-jurisdictions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Override Appeal Verdicts */}
      {activeTab === "override" && (
        <div className="max-w-[700px] mx-auto bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-headline-xs font-bold text-primary flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-primary" />
              <span>Override Appeal Verdicts</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Force override resolved appeal verdicts. Any change will be logged in system audit timeline files.
            </p>
          </div>

          {/* Search report form */}
          <form onSubmit={handleSearchReport} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                required
                value={searchPostId}
                onChange={(e) => setSearchPostId(e.target.value)}
                placeholder="Search report by Case ID (e.g. DU-R-XXXXX)..."
                className="w-full pl-9 pr-4 py-2 border border-outline-variant text-body-md rounded-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
            <button
              type="submit"
              disabled={searchingReport}
              className="bg-primary text-on-primary hover:bg-opacity-95 px-5 py-2 rounded text-label-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {searchingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Fetch Details</span>
              )}
            </button>
          </form>

          {/* Detailed search result & override form */}
          {foundReport && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary details card */}
              <div className="p-4 bg-slate-50 border border-outline-variant/60 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-slate-200 text-on-surface-variant font-bold px-2 py-0.5 rounded font-mono select-all">
                    ID: {foundReport.postId}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    foundReport.adminVerification?.status === "APPROVED"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : foundReport.adminVerification?.status === "REJECTED"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : "bg-yellow-50 text-yellow-800 border-yellow-200"
                  }`}>
                    Verdict: {foundReport.adminVerification?.status || "PENDING"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-body-md font-bold text-primary">{foundReport.sanitizedTitle}</h4>
                  <p className="text-xs text-on-surface-variant uppercase font-bold">{foundReport.harassmentType}</p>
                </div>

                <div className="text-xs text-on-surface-variant leading-relaxed bg-white border border-outline-variant/30 p-3 rounded italic max-h-[120px] overflow-y-auto">
                  &quot;{foundReport.narrative || foundReport.sanitizedDescription}&quot;
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleOverrideSubmit} className="space-y-4 pt-4 border-t">
                {/* Decision radio */}
                <div className="space-y-1.5">
                  <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider block">Target Override Verdict Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-body-md font-semibold text-green-800 cursor-pointer">
                      <input
                        type="radio"
                        name="overrideAction"
                        checked={overrideAction === "APPROVE"}
                        onChange={() => setOverrideAction("APPROVE")}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span>APPROVE (Verify as Ragging Incident)</span>
                    </label>

                    <label className="flex items-center gap-2 text-body-md font-semibold text-red-800 cursor-pointer">
                      <input
                        type="radio"
                        name="overrideAction"
                        checked={overrideAction === "REJECT"}
                        onChange={() => setOverrideAction("REJECT")}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span>REJECT (Dismiss Incident Report)</span>
                    </label>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="space-y-1.5">
                  <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider block">Verdict Override Explanation Note</label>
                  <textarea
                    required
                    rows={3}
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Document structural audit details or grounds for over-ruling the existing appeal stance..."
                    className="w-full px-3 py-2 border rounded border-outline-variant text-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                  />
                  <p className="text-[10px] text-outline italic">Mandatory: This note logs directly into the public case log timeline.</p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingOverride}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded text-label-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {submittingOverride ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying Override...</span>
                      </>
                    ) : (
                      <>
                        <Scale className="w-4 h-4" />
                        <span>Apply Override Stance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
