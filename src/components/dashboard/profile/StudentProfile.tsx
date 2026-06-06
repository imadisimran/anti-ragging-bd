"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    BadgeCheck,
    Lock,
    KeyRound,
    ChevronRight,
    AlertTriangle,
    Trash2,
    Edit3,
    Hourglass,
    AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";
import { getStudentProfile, updateStudentProfile, updateStudentPassword, getUniversitites, getStudyAreas } from "@/actions/server/profile";
import { sendVerificationEmail } from "@/actions/server/email";
import { useForm, useWatch } from "react-hook-form";
import { GetUniversity, StudentProfileData, UpdateProfileData } from "@/types/profile.type";

export default function StudentProfile() {
    const [profile, setProfile] = useState<StudentProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [universitites, setUniversitites] = useState<GetUniversity[] | null>(null);
    const [departments, setDepartments] = useState<string[] | null>(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [residentialHallsList, setResidentialHallsList] = useState<string[] | null>(null);
    const [loadingHalls, setLoadingHalls] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const updateProfileDialogRef = useRef<HTMLDialogElement>(null);
    const changePasswordDialogRef = useRef<HTMLDialogElement>(null);

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
        reset: resetProfile,
        setValue: setValueProfile,
        control: controlProfile
    } = useForm<UpdateProfileData>({
        defaultValues: {
            name: "",
            department: "",
            academicSession: "",
            residentialHall: "",
            university: "",
            facultyType: "",
            residentialType: ""
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
        reset: resetPassword
    } = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const selectedUniversity = useWatch({ control: controlProfile, name: "university" });
    const facultyType = useWatch({ control: controlProfile, name: "facultyType" });
    const residentialType = useWatch({ control: controlProfile, name: "residentialType" });



    useEffect(() => {
        if (profile) {
            resetProfile({
                name: profile.name || "",
                department: profile.studentDetails?.study?.name || "",
                academicSession: profile.studentDetails?.academicSession || "",
                residentialHall: profile.studentDetails?.residence?.name || "",
                university: profile.studentDetails?.university || "",
                facultyType: profile.studentDetails?.study?.type || "",
                residentialType: profile.studentDetails?.residence?.type || ""
            });
        }
    }, [profile, resetProfile]);

    useEffect(() => {
        async function loadDepartments() {
            if (!selectedUniversity || !facultyType) {
                setDepartments(null);
                // Optional: Clear the department value if requirements aren't met
                setValueProfile("department", "");
                return;
            }
            try {
                setLoadingDepartments(true);
                const res = await getStudyAreas({ university: selectedUniversity, locationType: facultyType });

                // Ensure res.data exists before checking keys
                if (res.success && res.data) {
                    // Dynamically read either res.data.institute or res.data.department
                    const fetchedDepts = res.data[facultyType] || res.data.department;

                    if (Array.isArray(fetchedDepts)) {
                        setDepartments(fetchedDepts);

                        const currentDeptValue = controlProfile._formValues.department;

                        if (currentDeptValue && !fetchedDepts.includes(currentDeptValue)) {
                            setValueProfile("department", "");
                        }
                    } else {
                        setDepartments([]);
                    }
                } else {
                    setDepartments([]);
                }
            } catch (err) {
                console.error("Error loading departments/institutes:", err);
                setDepartments([]);
            } finally {
                setLoadingDepartments(false);
            }
        }
        loadDepartments();
    }, [selectedUniversity, setValueProfile, controlProfile, facultyType]);

    useEffect(() => {
        async function loadHalls() {
            if (!selectedUniversity || !residentialType) {
                setResidentialHallsList(null);
                setValueProfile("residentialHall", "");
                return;
            }
            try {
                setLoadingHalls(true);
                const res = await getStudyAreas({ university: selectedUniversity, locationType: residentialType });

                if (res.success && res.data) {
                    const fetchedHalls = res.data[residentialType] || res.data.hall;

                    if (Array.isArray(fetchedHalls)) {
                        setResidentialHallsList(fetchedHalls);

                        const currentHallValue = controlProfile._formValues.residentialHall;

                        if (currentHallValue && !fetchedHalls.includes(currentHallValue)) {
                            setValueProfile("residentialHall", "");
                        }
                    } else {
                        setResidentialHallsList([]);
                    }
                } else {
                    setResidentialHallsList([]);
                }
            } catch (err) {
                console.error("Error loading halls/hostels:", err);
                setResidentialHallsList([]);
            } finally {
                setLoadingHalls(false);
            }
        }
        loadHalls();
    }, [selectedUniversity, setValueProfile, controlProfile, residentialType]);

    useEffect(() => {
        async function autoDetectTypes() {
            if (!profile || !profile.studentDetails?.university) return;
            
            // Auto detect facultyType
            if (profile.studentDetails.study?.name) {
                try {
                    const deptRes = await getStudyAreas({ university: profile.studentDetails.university, locationType: "department" });
                    if (deptRes.success && deptRes.data && Array.isArray(deptRes.data.department)) {
                        if (deptRes.data.department.includes(profile.studentDetails.study.name)) {
                            setValueProfile("facultyType", "department");
                        } else {
                            const instRes = await getStudyAreas({ university: profile.studentDetails.university, locationType: "institute" });
                            if (instRes.success && instRes.data && Array.isArray(instRes.data.institute)) {
                                if (instRes.data.institute.includes(profile.studentDetails.study.name)) {
                                    setValueProfile("facultyType", "institute");
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error auto-detecting facultyType:", e);
                }
            }

            // Auto detect residentialType
            if (profile.studentDetails.residence?.name) {
                try {
                    const hallRes = await getStudyAreas({ university: profile.studentDetails.university, locationType: "hall" });
                    if (hallRes.success && hallRes.data && Array.isArray(hallRes.data.hall)) {
                        if (hallRes.data.hall.includes(profile.studentDetails.residence.name)) {
                            setValueProfile("residentialType", "hall");
                        } else {
                            const hostelRes = await getStudyAreas({ university: profile.studentDetails.university, locationType: "hostel" });
                            if (hostelRes.success && hostelRes.data && Array.isArray(hostelRes.data.hostel)) {
                                if (hostelRes.data.hostel.includes(profile.studentDetails.residence.name)) {
                                    setValueProfile("residentialType", "hostel");
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error auto-detecting residentialType:", e);
                }
            }
        }
        autoDetectTypes();
    }, [profile, setValueProfile]);

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const res = await getStudentProfile();
                if (res.success && res.data) {
                    setProfile(res.data);
                } else {
                    setError(res.message || "Failed to load profile.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while loading profile.");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleUpdateProfile = async () => {
        updateProfileDialogRef.current?.showModal();
        const result = await getUniversitites()
        if (result.success && result.data) {
            setUniversitites(result.data);
        }
    };

    const onSubmitProfile = async (values: UpdateProfileData) => {
        try {
            updateProfileDialogRef.current?.close();

            Swal.fire({
                title: "Updating...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const res = await updateStudentProfile(values);
            if (res.success) {
                setProfile(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        name: values.name,
                        studentDetails: {
                            university: values.university || "",
                            academicSession: values.academicSession || "",
                            study: {
                                type: values.facultyType || "",
                                name: values.department || ""
                            },
                            residence: {
                                type: values.residentialType || "",
                                name: values.residentialHall || ""
                            }
                        }
                    };
                });
                Swal.fire({
                    title: "SUCCESSFUL",
                    text: "Your profile details have been updated.",
                    icon: "success",
                    confirmButtonColor: "var(--color-primary, #000000)"
                });
            } else {
                Swal.fire({
                    title: "FAILED",
                    text: res.message || "Failed to update profile.",
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

    const handleChangePassword = () => {
        changePasswordDialogRef.current?.showModal();
    };

    const onSubmitPassword = async (values: {
        currentPassword?: string;
        newPassword?: string;
    }) => {
        try {
            changePasswordDialogRef.current?.close();
            Swal.fire({
                title: "Updating...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const res = await updateStudentPassword(values);
            if (res.success) {
                Swal.fire({
                    title: "SUCCESSFUL",
                    text: "Your password has been updated.",
                    icon: "success",
                    confirmButtonColor: "var(--color-primary, #000000)"
                });
            } else {
                Swal.fire({
                    title: "FAILED",
                    text: res.message || "Failed to update password.",
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

    const handleDeleteAccount = () => {
        Swal.fire({
            title: "DELETE ACCOUNT?",
            text: "This action is permanent and cannot be undone. All your reports will be anonymized and you will lose access.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "YES, DELETE PERMANENTLY",
            cancelButtonText: "CANCEL",
            confirmButtonColor: "var(--color-error, #ba1a1a)",
            cancelButtonColor: "var(--color-outline, #76777d)",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Action Restricted",
                    text: "For security and judicial tracking compliance, self-service account deletion is restricted. Please contact your campus Proctor or Dean of Student Affairs.",
                    icon: "info",
                    confirmButtonColor: "var(--color-primary, #000000)"
                });
            }
        });
    };

    const handleSendVerification = async () => {
        try {
            setVerifyingEmail(true);
            Swal.fire({
                title: "Sending...",
                text: "Sending verification email, please wait.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const result = await sendVerificationEmail();
            if (result?.success) {
                Swal.fire({
                    title: "SUCCESSFUL",
                    text: result.message,
                    icon: "success",
                    confirmButtonColor: "var(--color-primary, #000000)"
                });
            } else {
                Swal.fire({
                    title: "FAILED",
                    text: result?.message || "Something went wrong.",
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
        } finally {
            setVerifyingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
                <Hourglass className="w-8 h-8 animate-spin text-secondary" />
                <p className="text-on-surface-variant font-body-lg">Loading profile details...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-error">
                <AlertCircle className="w-8 h-8 text-error" />
                <p className="font-body-lg">{error || "Failed to load profile details."}</p>
            </div>
        );
    }

    const isProfileIncomplete =
        !profile.name?.trim() ||
        !profile.studentDetails?.study?.name?.trim() ||
        !profile.studentDetails?.academicSession?.trim() ||
        !profile.studentDetails?.residence?.name?.trim() ||
        !profile.studentDetails?.university?.trim();

    return (
        <div className="space-y-gutter">

            {/* Header */}
            <header className="mb-10">
                <h2 className="text-headline-lg font-bold text-primary">Student Profile</h2>
                <p className="text-body-md text-on-surface-variant mt-1">
                    Manage your institutional identity and security settings.
                </p>
            </header>

            {isProfileIncomplete && (
                <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(245,158,11,0.08)] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3.5">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-700 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-label-md font-bold text-amber-900">Institutional Profile Incomplete</h4>
                            <p className="text-body-sm text-amber-800/80 mt-1 leading-relaxed">
                                Some verification details (department, session, hall, etc.) are missing. Please complete them to ensure safety tracking compliance.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleUpdateProfile}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap self-start sm:self-center shadow-sm hover:shadow shadow-amber-600/10"
                    >
                        Complete Profile
                    </button>
                </div>
            )}

            <div className="space-y-gutter">

                {/* Top Section: Profile Card */}
                <div className="bg-white rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] p-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-80"></div>

                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                                    {profile.name}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    Email
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md flex items-center justify-between transition-colors duration-200">
                                    <span>{profile.email}</span>
                                    {profile.isVerified ? (
                                        <BadgeCheck className="w-5 h-5 text-secondary fill-secondary-container" />
                                    ) : (
                                        <button
                                            onClick={handleSendVerification}
                                            disabled={verifyingEmail}
                                            className="px-2.5 py-1 text-xs font-bold bg-error/10 hover:bg-error/20 text-error rounded-full flex items-center gap-1.5 transition-colors border border-error/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>Verify Email</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Department */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    Department
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                                    {profile.studentDetails?.study?.name || <span className="text-on-surface-variant/40 italic">Not Provided</span>}
                                </div>
                            </div>

                            {/* Academic Session */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    Academic Session
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                                    {profile.studentDetails?.academicSession || <span className="text-on-surface-variant/40 italic">Not Provided</span>}
                                </div>
                            </div>

                            {/* University Name */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    University Name
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                                    {profile.studentDetails?.university || <span className="text-on-surface-variant/40 italic">Not Provided</span>}
                                </div>
                            </div>

                            {/* Residential Hall / Hostel */}
                            <div className="space-y-1.5">
                                <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                    Residential Hall / Hostel
                                </label>
                                <div className="bg-surface-container-low border border-outline-variant hover:border-secondary/40 px-4 py-2.5 rounded text-on-surface font-body-md transition-colors duration-200">
                                    {profile.studentDetails?.residence?.name || <span className="text-on-surface-variant/40 italic">Not Provided</span>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Section: Grid Layout for Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

                    {/* Security Card */}
                    <div className="bg-white rounded-xl border border-outline-variant p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-outline-variant">
                            <Lock className="w-6 h-6 text-secondary" />
                            <h3 className="text-headline-sm font-bold text-primary">Account Security & Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg flex flex-col gap-3">
                                <h4 className="text-label-md font-bold text-primary">Two-Factor Authentication</h4>
                                <p className="text-body-md text-on-surface-variant">
                                    Add an extra layer of security to your safety portal account.
                                </p>
                                <button className="text-secondary font-bold text-label-sm text-left hover:underline cursor-pointer">
                                    Enable 2FA Now →
                                </button>
                            </div>

                            <button
                                onClick={handleUpdateProfile}
                                className="w-full py-3 px-4 border border-outline text-on-surface font-bold text-label-md rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <Edit3 className="w-5 h-5 text-on-surface-variant" />
                                    <span>Update Profile Info</span>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {profile.provider === "credentials" && (
                                <button
                                    onClick={handleChangePassword}
                                    className="w-full py-3 px-4 border border-outline text-on-surface font-bold text-label-md rounded-lg flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <KeyRound className="w-5 h-5 text-on-surface-variant" />
                                        <span>Change Password</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="bg-red-50/50 rounded-xl border border-red-200 p-6 flex flex-col justify-between gap-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-error" />
                                <h3 className="text-headline-sm font-bold text-error">Danger Zone</h3>
                            </div>
                            <p className="text-body-md text-error/85 leading-relaxed">
                                Deleting your account is permanent. All filed reports will be anonymized further and you will lose access to active case tracking.
                            </p>
                        </div>

                        <button
                            onClick={handleDeleteAccount}
                            className="w-full py-3 px-4 bg-error text-white font-bold text-label-md rounded-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-error/10"
                        >
                            <Trash2 className="w-5 h-5 text-white" />
                            <span>Delete Account</span>
                        </button>
                    </div>

                </div>

                {/* Footer Policy Info */}
                <div className="pt-8 border-t border-outline-variant/30">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-50 text-label-sm text-on-surface-variant font-semibold">
                        <a className="hover:underline" href="#">Transparency Report</a>
                        <a className="hover:underline" href="#">Legal Rights</a>
                        <a className="hover:underline" href="#">Data Protection</a>
                    </div>
                    <p className="mt-4 text-[11px] text-on-surface-variant opacity-40 leading-relaxed uppercase tracking-tighter font-semibold">
                        © {new Date().getFullYear()} Anti-Ragging Bangladesh. Monitored by Judicial Integrity Commission.
                    </p>
                </div>

            </div>

            {/* Modals */}
            <dialog ref={updateProfileDialogRef} className="modal" onClose={() => resetProfile()}>
                <div className="modal-box max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-6">
                        <h3 className="text-headline-sm font-bold text-primary">Update Profile Info</h3>
                        <button
                            type="button"
                            onClick={() => { updateProfileDialogRef.current?.close(); }}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">

                        {/* Full Name */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                            <input
                                type="text"
                                {...registerProfile("name", { required: "Full name is required" })}
                                className={`w-full px-3.5 py-2.5 border rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all ${profileErrors.name ? "border-error focus:border-error" : "border-outline-variant"}`}
                            />
                            {profileErrors.name && (
                                <span className="text-xs text-error font-medium">{profileErrors.name.message}</span>
                            )}
                        </div>

                        {/* University Name */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">University Name</label>

                            <select
                                {...registerProfile("university")}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
                            >
                                <option value="" disabled>{universitites && universitites.length > 0 ? "Select University" : "Something went wrong!"}</option>
                                {universitites?.map((uni, idx) => (
                                    <option key={idx} value={uni.university}>
                                        {uni.university}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Faculty type */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Faculty Type</label>

                            <select
                                {...registerProfile("facultyType")}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
                            >
                                <option value="">Select Faculty Type</option>
                                <option value="institute">Institute</option>
                                <option value="department">Department</option>
                            </select>

                        </div>

                        {/* Department Name */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Department</label>
                            <select
                                {...registerProfile("department")}
                                disabled={loadingDepartments || !selectedUniversity}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>
                                    {loadingDepartments
                                        ? "Loading departments..."
                                        : !selectedUniversity
                                            ? "Select a university first"
                                            : departments === null || (departments.length === 0 && loadingDepartments)
                                                ? "Loading departments..."
                                                : departments.length === 0
                                                    ? "No departments found"
                                                    : "Select Department"}
                                </option>
                                {departments?.map((dept, idx) => (
                                    <option key={idx} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Academic Session */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Session</label>
                            <select
                                {...registerProfile("academicSession")}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
                            >
                                <option value="" disabled>
                                    Select Academic Session
                                </option>
                                <option value="2020-2021">2020-2021</option>
                                <option value="2021-2022">2021-2022</option>
                                <option value="2022-2023">2022-2023</option>
                                <option value="2023-2024">2023-2024</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2025-2026">2025-2026</option>
                            </select>
                        </div>

                        {/* Residential Type */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Residential Type</label>

                            <select
                                {...registerProfile("residentialType")}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
                            >
                                <option value="">Select Residential Type</option>
                                <option value="hall">Residential Hall</option>
                                <option value="hostel">Hostel</option>
                            </select>

                        </div>

                        {/* Residential Hall / Hostel */}

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Residential Hall / Hostel</label>
                            <select
                                {...registerProfile("residentialHall")}
                                disabled={loadingHalls || !selectedUniversity}
                                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>
                                    {loadingHalls
                                        ? "Loading halls..."
                                        : !selectedUniversity
                                            ? "Select a university first"
                                            : residentialHallsList === null || (residentialHallsList.length === 0 && loadingHalls)
                                                ? "Loading halls..."
                                                : residentialHallsList.length === 0
                                                    ? "No halls found"
                                                    : "Select Hall/Hostel"}
                                </option>
                                {residentialHallsList?.map((hall, idx) => (
                                    <option key={idx} value={hall}>
                                        {hall}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}

                        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-6">
                            <button
                                type="button"
                                onClick={() => { updateProfileDialogRef.current?.close(); }}
                                className="px-4 py-2 border border-outline text-on-surface hover:bg-surface-container font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingProfile}
                                className="px-4 py-2 bg-primary hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs rounded-lg transition-all shadow-sm hover:shadow shadow-primary/10 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmittingProfile ? "SAVING..." : "SAVE CHANGES"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit" className="cursor-default bg-transparent">close</button>
                </form>
            </dialog>

            <dialog ref={changePasswordDialogRef} className="modal" onClose={() => resetPassword()}>
                <div className="modal-box max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-6">
                        <h3 className="text-headline-sm font-bold text-primary">Change Password</h3>
                        <button
                            type="button"
                            onClick={() => { changePasswordDialogRef.current?.close(); }}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword("currentPassword", { required: "Current password is required" })}
                                className={`w-full px-3.5 py-2.5 border rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all ${passwordErrors.currentPassword ? "border-error focus:border-error" : "border-outline-variant"}`}
                            />
                            {passwordErrors.currentPassword && (
                                <span className="text-xs text-error font-medium">{passwordErrors.currentPassword.message}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword("newPassword", {
                                    required: "New password is required",
                                    minLength: { value: 8, message: "New password must be at least 8 characters long" }
                                })}
                                className={`w-full px-3.5 py-2.5 border rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all ${passwordErrors.newPassword ? "border-error focus:border-error" : "border-outline-variant"}`}
                            />
                            {passwordErrors.newPassword && (
                                <span className="text-xs text-error font-medium">{passwordErrors.newPassword.message}</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword("confirmPassword", {
                                    required: "Please confirm your new password",
                                    validate: (value, formValues) => value === formValues.newPassword || "New password and confirmation do not match"
                                })}
                                className={`w-full px-3.5 py-2.5 border rounded-lg text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all ${passwordErrors.confirmPassword ? "border-error focus:border-error" : "border-outline-variant"}`}
                            />
                            {passwordErrors.confirmPassword && (
                                <span className="text-xs text-error font-medium">{passwordErrors.confirmPassword.message}</span>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-6">
                            <button
                                type="button"
                                onClick={() => { changePasswordDialogRef.current?.close(); }}
                                className="px-4 py-2 border border-outline text-on-surface hover:bg-surface-container font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingPassword}
                                className="px-4 py-2 bg-primary hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs rounded-lg transition-all shadow-sm hover:shadow shadow-primary/10 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmittingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit" className="cursor-default bg-transparent">close</button>
                </form>
            </dialog>
        </div>
    );
}
