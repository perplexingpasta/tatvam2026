"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  collegeIdNumber: z.string().min(1, "College ID is required"),
  delegateTier: z.enum(["tier1", "tier2", "tier3"]),
  collegeIdImage: z.any()
    .refine((file) => typeof window !== "undefined" && file instanceof File, "College ID image is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 10MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png formats are supported."
    ),
});

const registrationSchema = z.object({
  teamName: z.string().optional(),
  members: z.array(memberSchema).min(1).max(25),
  utrNumber: z.string().optional(),
  paymentScreenshot: z.any().optional(),
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

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [generatedDelegateIds, setGeneratedDelegateIds] = useState<string[]>([]);
  const [generatedTeamId, setGeneratedTeamId] = useState<string | null>(null);

  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
          yearOfStudy: "",
          collegeIdNumber: "",
          delegateTier: "tier1",
          collegeIdImage: undefined,
        },
      ],
      utrNumber: "",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "members",
    control,
  });

  const watchMembers = watch("members");
  
  const totalCost = watchMembers.reduce((sum, member) => {
    const tier = TIERS.find((t) => t.id === member.delegateTier);
    return sum + (tier?.price || 0);
  }, 0);

  const handleAddMember = () => {
    if (fields.length >= 25) {
      alert("Maximum 25 members allowed");
      return;
    }
    append({
      name: "",
      email: "",
      phone: "",
      yearOfStudy: "",
      collegeIdNumber: "",
      delegateTier: "tier1",
      collegeIdImage: undefined,
    });
  };

  const handleNext = async () => {
    const isStep1Valid = await trigger(["members", "teamName"]);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be under 10MB");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG are allowed");
        return;
      }
      setValue("paymentScreenshot", file, { shouldValidate: true });
      setPaymentPreview(URL.createObjectURL(file));
    }
  };

  const handleCollegeIdChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be under 10MB");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG are allowed");
        return;
      }
      setValue(`members.${index}.collegeIdImage`, file, { shouldValidate: true });
      setImagePreviews(prev => ({ ...prev, [index]: URL.createObjectURL(file) }));
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!data.paymentScreenshot) {
      setError("Please provide a payment screenshot");
      return;
    }
    if (!data.utrNumber || !/^\d{1,22}$/.test(data.utrNumber)) {
      setError("Please provide a valid UTR number (up to 22 digits)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (data.members.length > 1 && data.teamName) {
        formData.append("teamName", data.teamName);
      }
      formData.append("paymentScreenshot", data.paymentScreenshot);
      formData.append("utrNumber", data.utrNumber);

      data.members.forEach((m, index) => {
        formData.append(`member_${index}_name`, m.name);
        formData.append(`member_${index}_email`, m.email);
        formData.append(`member_${index}_phone`, m.phone);
        formData.append(`member_${index}_yearOfStudy`, m.yearOfStudy);
        formData.append(`member_${index}_collegeIdNumber`, m.collegeIdNumber);
        formData.append(`member_${index}_delegateTier`, m.delegateTier);
        if (m.collegeIdImage) {
          formData.append(`member_${index}_collegeIdImage`, m.collegeIdImage);
        }
      });

      const res = await fetch("/api/registration/delegate", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setGeneratedDelegateIds(resData.delegateIds || []);
      setGeneratedTeamId(resData.teamId || null);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">Your registration has been submitted and is pending verification. Please save or screenshot this page for your records.</p>
          
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
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Delegate Registration
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-12">
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

              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
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
                        {...register(`members.${index}.phone`)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.phone ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.phone && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.phone?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                      <input
                        type="text"
                        {...register(`members.${index}.yearOfStudy`)}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white ${errors.members?.[index]?.yearOfStudy ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.members?.[index]?.yearOfStudy && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.yearOfStudy?.message}</p>}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">College ID Image</label>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={(e) => handleCollegeIdChange(index, e)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {errors.members?.[index]?.collegeIdImage && <p className="text-red-500 text-sm mt-1">{errors.members[index]?.collegeIdImage?.message as string}</p>}
                      {imagePreviews[index] && (
                        <div className="mt-2">
                          <img src={imagePreviews[index]} alt="ID Preview" className="h-20 w-auto object-contain border rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Delegate Tier</h4>
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
                  </div>
                </div>
              ))}

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
                  className="mt-4 sm:mt-0 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h3>
                <p className="text-gray-600 mb-6">Scan the QR code below and pay the exact total amount.</p>
                
                <div className="text-4xl font-extrabold text-blue-600 mb-8">
                  Total: ₹{totalCost}
                </div>

                <div className="flex justify-center mb-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <img 
                      src={process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_PATH || "/qr-code.webp"} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>

                <div className="max-w-md mx-auto text-left space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={handlePaymentScreenshotChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                    />
                    {paymentPreview && (
                      <div className="mt-4 flex justify-center">
                        <img src={paymentPreview} alt="Screenshot Preview" className="h-40 w-auto object-contain border rounded-lg shadow-sm" />
                      </div>
                    )}
                    {error && !paymentPreview && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
                    <p className="text-gray-400 text-xs mt-1">Maximum 22 digits</p>
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
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
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
