"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMerchCart } from "@/components/MerchCartProvider";
import { MerchCartUnit } from "@/types/merch";
import { StagedFileUpload } from "@/components/StagedFileUpload";
import { toast } from "sonner";

type PageState = 1 | 2 | 3;

export default function MerchCartPage() {
  const { merchCart, merchCartTotal, removeMerchUnit, clearMerchCart } =
    useMerchCart();
  const [pageState, setPageState] = useState<PageState>(1);
  const [mounted, setMounted] = useState(false);

  // Buyer details
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  
  const [paymentScreenshot, setPaymentScreenshot] = useState<{
    originalUrl: string | null;
  }>({ originalUrl: null });

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success data
  const [orderId, setOrderId] = useState<string>("");
  const [finalUnits, setFinalUnits] = useState<MerchCartUnit[]>([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const [finalEmail, setFinalEmail] = useState("");
  const [finalPhone, setFinalPhone] = useState("");
  const [finalUtr, setFinalUtr] = useState("");

  const qrImagePath =
    process.env.NEXT_PUBLIC_MERCH_PAYMENT_QR_IMAGE_PATH || "/qr-code.webp";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 text-center">Loading...</div>;

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "buyerName":
        if (!value.trim()) error = "Name is required";
        break;
      case "buyerEmail":
        if (!/^\S+@\S+\.\S+$/.test(value)) error = "Valid email is required";
        break;
      case "buyerPhone":
        if (!/^\d{10,}$/.test(value.replace(/\D/g, "")))
          error = "Valid phone number (min 10 digits) is required";
        break;
      case "utrNumber":
        if (!/^[A-Za-z0-9]{12,22}$/.test(value))
          error = "UTR must be 12-22 alphanumeric characters";
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "buyerName":
        setBuyerName(value);
        break;
      case "buyerEmail":
        setBuyerEmail(value);
        break;
      case "buyerPhone":
        setBuyerPhone(value);
        break;
      case "utrNumber":
        setUtrNumber(value);
        break;
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isFormValid = () => {
    return (
      buyerName.trim() &&
      /^\S+@\S+\.\S+$/.test(buyerEmail) &&
      /^\d{10,}$/.test(buyerPhone.replace(/\D/g, "")) &&
      /^[A-Za-z0-9]{12,22}$/.test(utrNumber) &&
      Object.values(errors).every((err) => !err)
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    if (!paymentScreenshot.originalUrl) {
      setSubmitError("Please wait for the payment screenshot to finish uploading");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    try {
      const formData = new FormData();
      formData.append("buyerName", buyerName);
      formData.append("buyerEmail", buyerEmail);
      formData.append("buyerPhone", buyerPhone);
      formData.append("utrNumber", utrNumber);
      formData.append("paymentScreenshotUrl", paymentScreenshot.originalUrl);
      formData.append("units", JSON.stringify(merchCart));

      const res = await fetch("/api/merch/order", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to place order");
      }

      // Save success data before clearing cart
      setFinalUnits([...merchCart]);
      setFinalTotal(merchCartTotal);
      setFinalEmail(buyerEmail);
      setFinalPhone(buyerPhone);
      setFinalUtr(utrNumber);
      setOrderId(data.orderId);

      clearMerchCart();
      setPageState(3);
      toast.success("Order placed successfully!");
      window.scrollTo(0, 0);
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") {
        setSubmitError(
          "Upload is taking too long. Please check your connection and try again.",
        );
        toast.error("Upload is taking too long. Please check your connection and try again.");
      } else {
        setSubmitError(error.message || "An unexpected error occurred");
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  // State 3: Success Screen
  if (pageState === 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h1>
          <p className="text-gray-600 mb-8">
            Save this Order ID — our team will reference it when contacting you
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-600 font-semibold mb-1">
              Your Order ID
            </p>
            <p className="text-4xl font-mono font-bold text-blue-900">
              {orderId}
            </p>
          </div>

          <div className="text-left bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Order Summary
            </h2>
            <div className="space-y-4 mb-4">
              {finalUnits.map((unit, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{unit.itemName}</p>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      {Object.entries(unit.attributes).map(([key, val]) => (
                        <p key={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                          {val as string}
                        </p>
                      ))}
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">₹{unit.price}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center text-lg font-bold text-gray-900">
              <p>Total Paid</p>
              <p>₹{finalTotal}</p>
            </div>
            <div className="border-t mt-4 pt-4 text-sm text-gray-600">
              <p>
                <strong>UTR:</strong> {finalUtr}
              </p>
            </div>
          </div>

          <div className="text-left space-y-4 mb-8">
            <p className="text-gray-700 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              A confirmation email has been sent to{" "}
              <strong>{finalEmail}</strong>
            </p>
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md text-yellow-800 text-sm">
              <p className="font-semibold mb-1">Pickup Information</p>
              <p>
                All orders can be picked up from the registration desk. Our team
                will contact you at <strong>{finalPhone}</strong> to confirm
                your order details.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-gray-800 text-sm">
              <p className="font-semibold mb-1">Team Contacts</p>
              <p>
                For queries, contact: [Team Lead Name] - [Phone Number]
              </p>
            </div>
          </div>

          <Link
            href="/merch"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Shop More
          </Link>
        </div>
      </div>
    );
  }

  // State 1: Empty cart
  if (pageState === 1 && merchCart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 w-full text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 max-w-lg mx-auto">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added any merch yet.
          </p>
          <Link
            href="/merch"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Merch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Merch Cart</h1>
        {pageState === 2 && (
          <button
            onClick={() => setPageState(1)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Cart
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {pageState === 1 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {merchCart.map((unit) => (
                  <div
                    key={unit.unitId}
                    className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {unit.itemName}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {Object.entries(unit.attributes).map(([key, value]) => (
                          <p key={key}>
                            <span className="font-medium text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>{" "}
                            {value as string}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                      <span className="font-bold text-gray-900 text-xl">
                        ₹{unit.price}
                      </span>
                      <button
                        onClick={() => removeMerchUnit(unit.unitId)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STATE 2: Buyer Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Buyer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="buyerName"
                      value={buyerName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.buyerName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Your name"
                    />
                    {errors.buyerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.buyerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="buyerEmail"
                      value={buyerEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2.5 border rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.buyerEmail ? "border-red-500" : "border-gray-300"}`}
                      placeholder="you@example.com"
                    />
                    {errors.buyerEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.buyerEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="buyerPhone"
                      value={buyerPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2.5 border rounded-lg shadow-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.buyerPhone ? "border-red-500" : "border-gray-300"}`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.buyerPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.buyerPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STATE 2: Payment Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Payment
                </h2>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6 text-center">
                  <p className="text-lg text-blue-900 font-medium mb-4">
                    Pay{" "}
                    <span className="text-2xl font-bold">
                      ₹{merchCartTotal}
                    </span>{" "}
                    via UPI
                  </p>
                  <div className="relative w-48 h-48 mx-auto bg-white p-2 rounded-xl shadow-sm mb-4">
                    <Image
                      src={qrImagePath}
                      alt="Payment QR Code"
                      fill
                      className="object-contain rounded-lg"
                      priority={false}
                    />
                  </div>
                  <p className="text-sm text-blue-700">
                    Scan this QR code to complete your payment.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <StagedFileUpload
                      folder="merch-payments"
                      label="Payment Screenshot *"
                      compressionTargetMB={0.8}
                      maxWidthOrHeight={2000}
                      onUploadComplete={(urls) => {
                        setPaymentScreenshot({ originalUrl: urls.originalUrl });
                      }}
                      onUploadReset={() => {
                        setPaymentScreenshot({ originalUrl: null });
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="utrNumber"
                      value={utrNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-gray-900 ${errors.utrNumber ? "border-red-500" : "border-gray-300"}`}
                      placeholder="e.g. 123456789012"
                    />
                    {errors.utrNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.utrNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 shrink-0">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Items ({merchCart.length})</span>
              <span>₹{merchCartTotal}</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{merchCartTotal}</span>
            </div>

            {pageState === 1 ? (
              <div className="space-y-3">
                <button
                  onClick={() => setPageState(2)}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proceed to Order
                </button>
                <Link
                  href="/merch"
                  className="block w-full text-center py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid()}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
                {submitError && (
                  <p className="text-red-500 text-sm text-center mt-2 font-medium bg-red-50 p-2 rounded-md border border-red-100">
                    {submitError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}