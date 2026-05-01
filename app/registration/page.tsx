"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StagedFileUpload } from "@/components/StagedFileUpload";
import { toast } from "sonner";

const TIERS = [
  {
    id: "tier1",
    name: process.env.NEXT_PUBLIC_TIER_1_NAME || "Gold",
    price: parseInt(process.env.NEXT_PUBLIC_TIER_1_PRICE || "100", 10),
    description: "Basic access to all non-premium events.",
  },
  {
    id: "tier2",
    name: process.env.NEXT_PUBLIC_TIER_2_NAME || "Platinum",
    price: parseInt(process.env.NEXT_PUBLIC_TIER_2_PRICE || "200", 10),
    description: "Includes premium events and lunch.",
  },
  {
    id: "tier3",
    name: process.env.NEXT_PUBLIC_TIER_3_NAME || "Diamond",
    price: parseInt(process.env.NEXT_PUBLIC_TIER_3_PRICE || "300", 10),
    description: "All access pass + merchandise + lunch + priority seating.",
  },
];

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  collegeName: z.string().optional(),
  collegeIdNumber: z.string().min(1, "College ID is required"),
  delegateTier: z.enum(["tier1", "tier2", "tier3"]).optional(),
});

const registrationSchema = z.object({
  teamName: z.string().optional(),
  members: z.array(memberSchema).min(1).max(25),
  utrNumber: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.members.length > 1 && (!data.teamName || data.teamName.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamName"],
      message: "Team name is required when registering multiple members",
    });
  }
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

type RegistrationMode = "selection" | "jssmc" | "external";

interface MemberUploadState {
  collegeIdImageOriginalUrl: string | null;
  collegeIdImageTransformedUrl: string | null;
}

export default function RegistrationPage() {
  const [mode, setMode] = useState<RegistrationMode>("selection");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [generatedDelegateIds, setGeneratedDelegateIds] = useState<string[]>([]);
  const [generatedTeamId, setGeneratedTeamId] = useState<string | null>(null);

  const [memberUploads, setMemberUploads] = useState<MemberUploadState[]>([
    { collegeIdImageOriginalUrl: null, collegeIdImageTransformedUrl: null }
  ]);

  const [isUploadingCollegeId, setIsUploadingCollegeId] = useState<boolean[]>([false]);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  const [paymentScreenshot, setPaymentScreenshot] = useState<{
    originalUrl: string | null;
    transformedUrl: string | null;
  }>({ originalUrl: null, transformedUrl: null });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    setError: setFormError,
    reset,
    getValues,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: "",
      members: [
        {
          name: "",
          email: "",
          phone: "",
          collegeName: "",
          collegeIdNumber: "",
          delegateTier: "tier1",
        },
      ],
      utrNumber: "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    name: "members",
    control,
  });

  const watchMembers = useWatch({ control, name: "members" }) || [];
  
  const totalCost = watchMembers.reduce((sum, member) => {
    const tierId = mode === "jssmc" ? "tier3" : member.delegateTier;
    const tier = TIERS.find((t) => t.id === tierId);
    return sum + (mode === "jssmc" ? 0 : (tier?.price || 0));
  }, 0);

  const handleSelectMode = (newMode: "jssmc" | "external") => {
    setMode(newMode);
    setStep(1);
    setError(null);
    reset({
      teamName: "",
      members: [
        {
          name: "",
          email: "",
          phone: "",
          collegeName: newMode === "jssmc" ? "JSS Medical College" : "",
          collegeIdNumber: "",
          delegateTier: newMode === "jssmc" ? "tier3" : "tier1",
        },
      ],
      utrNumber: "",
    });
    setMemberUploads([{ collegeIdImageOriginalUrl: null, collegeIdImageTransformedUrl: null }]);
    setIsUploadingCollegeId([false]);
    setIsUploadingPayment(false);
    setPaymentScreenshot({ originalUrl: null, transformedUrl: null });
  };

  const handleBackToSelection = () => {
    setMode("selection");
    setMemberUploads([{ collegeIdImageOriginalUrl: null, collegeIdImageTransformedUrl: null }]);
    setIsUploadingCollegeId([false]);
    setIsUploadingPayment(false);
    setPaymentScreenshot({ originalUrl: null, transformedUrl: null });
  };

  const handleAddMember = () => {
    if (fields.length >= 25) {
      toast.error("Maximum 25 members allowed");
      return;
    }
    append({
      name: "",
      email: "",
      phone: "",
      collegeName: mode === "jssmc" ? "JSS Medical College" : "",
      collegeIdNumber: "",
      delegateTier: mode === "jssmc" ? "tier3" : "tier1",
    });
    setMemberUploads(prev => [...prev, { collegeIdImageOriginalUrl: null, collegeIdImageTransformedUrl: null }]);
    setIsUploadingCollegeId(prev => [...prev, false]);
  };

  const handleRemoveMember = (index: number) => {
    remove(index);
    setMemberUploads(prev => {
      const newUploads = [...prev];
      newUploads.splice(index, 1);
      return newUploads;
    });
    setIsUploadingCollegeId(prev => {
      const newArr = [...prev];
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const submitRegistration = async (membersData: RegistrationFormValues["members"], paymentData?: { utrNumber: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      const currentTeamName = getValues("teamName");
      if (membersData.length > 1 && currentTeamName) {
        formData.append("teamName", currentTeamName);
      }
      
      formData.append("isJSSMC", mode === "jssmc" ? "true" : "false");

      if (mode === "external") {
        if (!paymentScreenshot.originalUrl) throw new Error("Payment screenshot missing");
        if (!paymentData?.utrNumber) throw new Error("UTR number missing");
        formData.append("paymentScreenshotUrl", paymentScreenshot.originalUrl);
        formData.append("utrNumber", paymentData.utrNumber);
      }

      membersData.forEach((m: RegistrationFormValues["members"][0], index: number) => {
        formData.append(`member_${index}_name`, m.name);
        formData.append(`member_${index}_email`, m.email);
        formData.append(`member_${index}_phone`, m.phone);
        formData.append(`member_${index}_collegeName`, mode === "jssmc" ? "JSS Medical College" : (m.collegeName || ""));
        formData.append(`member_${index}_collegeIdNumber`, m.collegeIdNumber);
        formData.append(`member_${index}_delegateTier`, mode === "jssmc" ? "tier3" : (m.delegateTier || ""));
        
        if (memberUploads[index]?.collegeIdImageOriginalUrl) {
          formData.append(`member_${index}_collegeIdImageUrl`, memberUploads[index].collegeIdImageOriginalUrl!);
        }
        if (memberUploads[index]?.collegeIdImageTransformedUrl) {
          formData.append(`member_${index}_collegeIdImageTransformedUrl`, memberUploads[index].collegeIdImageTransformedUrl!);
        }
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let res;
      try {
        res = await fetch("/api/registration/delegate", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error("Upload is taking too long. Please check your connection and try again.");
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setGeneratedDelegateIds(resData.delegateIds || []);
      setGeneratedTeamId(resData.teamId || null);
      setSuccess(true);
      toast.success("Registration submitted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const isStep1Valid = await trigger(["members", "teamName"]);
    if (!isStep1Valid) return;

    if (mode === "external") {
      let hasCollegeNameError = false;
      watchMembers.forEach((m, idx) => {
        if (!m.collegeName || m.collegeName.trim() === "") {
          setFormError(`members.${idx}.collegeName`, { type: "manual", message: "College name is required" });
          hasCollegeNameError = true;
        } else if (m.collegeName.trim().toLowerCase() === "jss medical college") {
          setFormError(`members.${idx}.collegeName`, { type: "manual", message: "JSSMC students must use the JSSMC registration form" });
          hasCollegeNameError = true;
        }
      });
      if (hasCollegeNameError) return;
    }

    const pendingCollegeIds = watchMembers
      .map((_, i) => i)
      .filter(i => !memberUploads[i]?.collegeIdImageOriginalUrl);
    
    if (pendingCollegeIds.length > 0) {
      const anyUploading = isUploadingCollegeId.some(Boolean);
      if (anyUploading) {
        toast.warning("Please wait — College ID is still uploading");
      } else {
        const pendingNames = pendingCollegeIds.map(i => watchMembers[i]?.name || `Member ${i + 1}`).join(", ");
        setError(`Please upload the College ID for: ${pendingNames}`);
      }
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const emails = watchMembers.map(m => m.email).filter(Boolean).join(",");
      const phones = watchMembers.map(m => m.phone).filter(Boolean).join(",");
      const collegeIds = watchMembers.map(m => m.collegeIdNumber).filter(Boolean).join(",");

      const res = await fetch(`/api/registration/validate?emails=${encodeURIComponent(emails)}&phones=${encodeURIComponent(phones)}&collegeIds=${encodeURIComponent(collegeIds)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Validation failed");
      }

      if (data.conflicts && data.conflicts.length > 0) {
        data.conflicts.forEach((conflict: { field: string; value: string }) => {
          watchMembers.forEach((m, index) => {
            if (m[conflict.field as keyof typeof m] === conflict.value) {
              const fieldName = conflict.field === "collegeIdNumber" ? "College ID Number" : conflict.field.charAt(0).toUpperCase() + conflict.field.slice(1);
              setFormError(`members.${index}.${conflict.field as "email" | "phone" | "collegeIdNumber"}`, {
                type: "manual",
                message: `This ${fieldName} is already registered`,
              });
            }
          });
        });
        setError("Some members are already registered. Please check the errors above.");
        return;
      }

      if (mode === "jssmc") {
        await submitRegistration(watchMembers);
      } else {
        setStep(2);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Validation failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    if (mode === "external") {
      const paymentPending = !paymentScreenshot.originalUrl;
      if (paymentPending) {
        if (isUploadingPayment) {
          toast.warning("Please wait — payment screenshot is still uploading");
        } else {
          setError("Please upload the payment screenshot before submitting");
        }
        return;
      }
      if (!data.utrNumber || !/^[A-Za-z0-9]{12,22}$/.test(data.utrNumber)) {
        setError("Please provide a valid UTR number (12-22 alphanumeric characters)");
        return;
      }
      await submitRegistration(data.members, { utrNumber: data.utrNumber });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Complete!</h2>
          <p className="text-gray-600 mb-6">
            {mode === "jssmc" 
              ? "Your registration has been submitted successfully." 
              : "Your registration has been submitted and your payment is pending verification."}
            <br />
            <strong className="text-red-600">Save your delegate ID &mdash; you will need it to register for events.</strong>
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
            {generatedTeamId && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <span className="block text-sm text-gray-500 font-medium mb-1">Team ID</span>
                <span className="text-2xl font-bold text-blue-700">{generatedTeamId}</span>
              </div>
            )}
            
            <div>
              <span className="block text-sm text-gray-500 font-medium mb-3">Delegate IDs</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedDelegateIds.map((id, idx) => (
                  <div key={id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                    <span className="text-sm font-medium text-gray-600">
                      {watchMembers[idx]?.name || `Member ${idx + 1}`}
                    </span>
                    <span className="font-bold text-gray-900">{id}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {mode === "jssmc" && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-green-700 font-medium">
                Note: As a JSSMC student, your registration is complimentary and no payment was required.
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setMode("selection");
            }}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  if (mode === "selection") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Select Delegate Type
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">JSS Medical College Student</h2>
                <p className="text-gray-600 mb-6">Free registration &mdash; exclusive to JSSMC students</p>
              </div>
              <button 
                onClick={() => handleSelectMode("jssmc")}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
              >
                Register as JSSMC Student
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Other College Student</h2>
                <p className="text-gray-600 mb-6">Delegate kit purchase required</p>
              </div>
              <button 
                onClick={() => handleSelectMode("external")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
              >
                Register as External Student
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <button 
              onClick={handleBackToSelection}
              className="text-gray-500 hover:text-gray-800 font-medium"
            >
              &larr; Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center flex-1">
              {mode === "jssmc" ? "JSSMC Registration" : "Delegate Registration"}
            </h1>
            <div className="w-12"></div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-12">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Remove
                    </button>
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
                    Member {index + 1} {index === 0 && "(Team Lead)"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        {...register(`members.${index}.name`)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.name && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.name?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        {...register(`members.${index}.email`)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.email && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.email?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        {...register(`members.${index}.phone`, {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          }
                        })}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.phone ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.phone && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.phone?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                      {mode === "jssmc" ? (
                        <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 font-medium">
                          JSS Medical College
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            {...register(`members.${index}.collegeName`)}
                            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.collegeName ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.members?.[index]?.collegeName && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.collegeName?.message}</p>}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">College ID Number</label>
                      <input
                        type="text"
                        {...register(`members.${index}.collegeIdNumber`)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.collegeIdNumber ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.collegeIdNumber && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.collegeIdNumber?.message}</p>}
                    </div>
                    <div>
                      <StagedFileUpload
                        folder="college-ids"
                        label="College ID Image"
                        compressionTargetMB={0.5}
                        maxWidthOrHeight={1200}
                        onUploadingChange={(uploading) => {
                          setIsUploadingCollegeId(prev => {
                            const next = [...prev];
                            next[index] = uploading;
                            return next;
                          });
                        }}
                        onUploadComplete={(urls) => {
                          setMemberUploads(prev => {
                            const newUploads = [...prev];
                            if (newUploads[index]) {
                              newUploads[index] = {
                                collegeIdImageOriginalUrl: urls.originalUrl,
                                collegeIdImageTransformedUrl: urls.transformedUrl
                              };
                            }
                            return newUploads;
                          });
                        }}
                        onUploadReset={() => {
                          setMemberUploads(prev => {
                            const newUploads = [...prev];
                            if (newUploads[index]) {
                              newUploads[index] = {
                                collegeIdImageOriginalUrl: null,
                                collegeIdImageTransformedUrl: null
                              };
                            }
                            return newUploads;
                          });
                        }}
                        disabled={isValidating || isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Delegate Tier</h4>
                    {mode === "jssmc" ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-800 font-bold">Tier: {process.env.NEXT_PUBLIC_TIER_3_NAME || "Diamond"} (complimentary)</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TIERS.map((tier) => (
                          <div
                            key={tier.id}
                            onClick={() => {
                              setValue(`members.${index}.delegateTier`, tier.id as "tier1"|"tier2"|"tier3", { shouldValidate: true });
                            }}
                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                              watchMembers[index]?.delegateTier === tier.id
                                ? "border-blue-600 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-blue-300 bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-gray-900">{tier.name}</span>
                              <span className="font-bold text-blue-600">₹{tier.price}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {fields.length > 1 && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <label className="block text-sm font-bold text-blue-900 mb-2">
                    Team Name (Required for multiple members)
                  </label>
                  <input
                    type="text"
                    {...register("teamName")}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.teamName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && <p className="text-red-500 text-sm mt-1">{errors.teamName.message}</p>}
                </div>
              )}

              <div className="flex justify-center mt-8">
                {fields.length < 25 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <span>+ Add Member</span>
                  </button>
                )}
              </div>

              <div className="mt-12 bg-gray-900 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center text-white">
                <div>
                  <p className="text-gray-400 text-sm">Total Members: {fields.length}</p>
                  <p className="text-2xl font-bold">Total Cost: ₹{totalCost}</p>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isValidating || isSubmitting}
                  className={`mt-4 sm:mt-0 px-8 py-3 ${mode === "jssmc" ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"} rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-50`}
                >
                  {isValidating || isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isSubmitting ? "Submitting..." : "Checking..."}
                    </span>
                  ) : (
                    mode === "jssmc" ? "Complete Registration" : "Proceed to Payment →"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && mode === "external" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h3>
                <p className="text-gray-600 mb-6">Scan the QR code below and pay the exact total amount.</p>
                
                <div className="text-4xl font-extrabold text-blue-600 mb-8">
                  Total: ₹{totalCost}
                </div>

                <div className="flex justify-center mb-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Image 
                      src={process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_PATH || "/qr-code.webp"} 
                      alt="Payment QR Code" 
                      width={192}
                      height={192}
                      priority={false}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="max-w-md mx-auto text-left space-y-6">
                  <div>
                    <StagedFileUpload
                      folder="payment-proofs"
                      label="Upload Payment Screenshot"
                      compressionTargetMB={0.8}
                      maxWidthOrHeight={2000}
                      onUploadingChange={setIsUploadingPayment}
                      onUploadComplete={(urls) => {
                        setPaymentScreenshot({
                          originalUrl: urls.originalUrl,
                          transformedUrl: urls.transformedUrl
                        });
                      }}
                      onUploadReset={() => {
                        setPaymentScreenshot({ originalUrl: null, transformedUrl: null });
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">UTR / Transaction Number</label>
                    <input
                      type="text"
                      {...register("utrNumber")}
                      maxLength={22}
                      placeholder="e.g. 123456789012"
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.utrNumber ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.utrNumber && <p className="text-red-500 text-sm mt-1">{errors.utrNumber.message}</p>}
                    <p className="text-gray-400 text-xs mt-1">12-22 digits</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  ← Back to Details
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
