"use client";

import { useSportsCart } from "@/components/SportsCartProvider";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { StagedFileUpload } from "@/components/StagedFileUpload";
import { toast } from "sonner";

interface ParticipantDetails {
  id: string;
  name: string;
  collegeName: string;
  delegateTier: string;
  teamId: string | null;
}

interface CartItemState {
  eventId: string;
  eventName: string;
  eventType: "solo" | "group";
  eventFee: number;
  minTeamSize: number;
  maxTeamSize: number;
  participants: (ParticipantDetails | null)[];
  inputIds: string[];
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
}

export default function SportsCartPage() {
  const { sportsCart: cart, removeFromSportsCart: removeFromCart, clearSportsCart: clearCart } = useSportsCart();
  const [itemStates, setItemStates] = useState<Record<string, CartItemState>>({});
  
  // Checkout state
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<{
    originalUrl: string | null;
    transformedUrl: string | null;
  }>({ originalUrl: null, transformedUrl: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  // Initialize item states if not present
  if (cart.length > 0 && Object.keys(itemStates).length === 0) {
    const initialStates: Record<string, CartItemState> = {};
    cart.forEach(event => {
      const isSolo = event.type === "solo";
      const count = isSolo ? 1 : (event.minTeamSize || 1);
      initialStates[event.eventId] = {
        eventId: event.eventId,
        eventName: event.name,
        eventType: event.type,
        eventFee: event.fee,
        minTeamSize: event.minTeamSize || 1,
        maxTeamSize: event.maxTeamSize || 1,
        participants: Array(count).fill(null),
        inputIds: Array(count).fill(""),
        isVerified: false,
        isVerifying: false,
        error: null
      };
    });
    setItemStates(initialStates);
  }

  const lookupDelegate = async (id: string, eventId: string): Promise<ParticipantDetails | null> => {
    try {
      const res = await fetch(`/api/delegates/lookup?id=${encodeURIComponent(id)}&eventId=${encodeURIComponent(eventId)}`);
      const data = await res.json();
      if (!data.success) {
        setItemStates(prev => ({
          ...prev,
          [eventId]: { ...prev[eventId], error: data.message || "Delegate not found" }
        }));
        return null;
      }
      return { id, ...data.delegate };
    } catch {
      setItemStates(prev => ({
        ...prev,
        [eventId]: { ...prev[eventId], error: "Error looking up delegate" }
      }));
      return null;
    }
  };

  const handleSoloVerify = async (eventId: string) => {
    const state = itemStates[eventId];
    const id = state.inputIds[0].trim();
    if (!id) return;

    setItemStates(prev => ({ ...prev, [eventId]: { ...prev[eventId], error: null } }));
    const delegate = await lookupDelegate(id, eventId);
    if (delegate) {
      setItemStates(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          participants: [delegate],
          isVerified: true
        }
      }));
    }
  };

  const handleGroupVerify = async (eventId: string) => {
    const state = itemStates[eventId];
    const ids = state.inputIds.map(i => i.trim()).filter(Boolean);
    
    if (ids.length < state.minTeamSize || ids.length > state.maxTeamSize) {
      setItemStates(prev => ({
        ...prev,
        [eventId]: { ...prev[eventId], error: `Please enter between ${state.minTeamSize} and ${state.maxTeamSize} IDs` }
      }));
      return;
    }

    // Check for duplicates within the group
    if (new Set(ids).size !== ids.length) {
      setItemStates(prev => ({
        ...prev,
        [eventId]: { ...prev[eventId], error: "Duplicate IDs entered for this team" }
      }));
      return;
    }

    setItemStates(prev => ({ ...prev, [eventId]: { ...prev[eventId], error: null } }));
    
    const participants: ParticipantDetails[] = [];
    for (const id of ids) {
      const delegate = await lookupDelegate(id, eventId);
      if (!delegate) return; // error already set by lookupDelegate
      participants.push(delegate);
    }

    setItemStates(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        participants,
        isVerified: true
      }
    }));
  };

  const handleAddGroupMember = (eventId: string) => {
    setItemStates(prev => {
      const state = prev[eventId];
      if (state.inputIds.length >= state.maxTeamSize) return prev;
      return {
        ...prev,
        [eventId]: {
          ...state,
          inputIds: [...state.inputIds, ""],
          participants: [...state.participants, null]
        }
      };
    });
  };

  const handleRemoveGroupMember = (eventId: string, index: number) => {
    setItemStates(prev => {
      const state = prev[eventId];
      if (state.inputIds.length <= state.minTeamSize) return prev;
      
      const newInputs = [...state.inputIds];
      newInputs.splice(index, 1);
      const newParticipants = [...state.participants];
      newParticipants.splice(index, 1);
      
      return {
        ...prev,
        [eventId]: {
          ...state,
          inputIds: newInputs,
          participants: newParticipants,
          isVerified: false // Needs re-verification
        }
      };
    });
  };

  const resetVerification = (eventId: string) => {
    setItemStates(prev => ({
      ...prev,
      [eventId]: { ...prev[eventId], isVerified: false, participants: prev[eventId].participants.map(() => null), error: null }
    }));
  };

  const handleRemoveFromCart = (eventId: string) => {
    removeFromCart(eventId);
    setItemStates(prev => {
      const newState = { ...prev };
      delete newState[eventId];
      return newState;
    });
    toast("Event removed from cart");
  };

  const allVerified = cart.length > 0 && cart.every(event => itemStates[event.eventId]?.isVerified);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allVerified) {
      setCheckoutError("Please verify all delegates for all events before checking out.");
      return;
    }
    if (!utrNumber || !paymentScreenshot.originalUrl) {
      if (isUploadingPayment) {
        toast.warning("Please wait — payment screenshot is still uploading");
      } else {
        setCheckoutError("Please provide both UTR number and wait for payment screenshot to upload.");
      }
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    const formData = new FormData();
    formData.append("utrNumber", utrNumber);
    formData.append("paymentScreenshotUrl", paymentScreenshot.originalUrl);

    const cartItemsPayload = cart.map(event => {
      const state = itemStates[event.eventId];
      return {
        eventId: event.eventId,
        eventName: event.name,
        eventType: event.type,
        participantDelegateIds: state.participants.map(p => p!.id),
        teamId: state.participants[0]?.teamId || null,
        eventFee: event.fee
      };
    });

    formData.append("cartItems", JSON.stringify(cartItemsPayload));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      let res;
      try {
        res = await fetch("/api/registration/sports", {
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

      const data = await res.json();

      if (res.ok && data.success) {
        setCheckoutSuccess(true);
        toast.success("Event registration submitted!");
        clearCart();
        setItemStates({});
      } else {
        const errorMsg = data.message || "An error occurred during checkout.";
        setCheckoutError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "Failed to submit registration. Please try again.";
      setCheckoutError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-12">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Registration Submitted!</h2>
          <p className="text-lg text-zinc-600 mb-8">
            Your event registration has been received. We are verifying your payment.
            A confirmation email has been sent to the lead delegate.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-black rounded-lg hover:bg-zinc-800 "
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Your Cart</h1>
      
      <div className="mb-8">
        <Link href="/cart" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors">
          Looking for cultural events cart? <span aria-hidden="true">&rarr;</span> /cart
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 border rounded-xl border-dashed">
          <p className="text-lg text-zinc-600 mb-4">Your cart is empty.</p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-white transition duration-200 bg-black rounded-lg hover:bg-zinc-800 "
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-6">
            {cart.map((event) => {
              const state = itemStates[event.eventId];
              if (!state) return null;

              return (
                <div key={event.eventId} className="bg-white border border-zinc-200 rounded-xl overflow-hidden p-6 relative">
                  <button
                    onClick={() => handleRemoveFromCart(event.eventId)}
                    className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove Event
                  </button>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium">{event.type}</span>
                      <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium">• ₹{event.fee}</span>
                    </div>
                  </div>

                  {state.error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                      {state.error}
                    </div>
                  )}

                  {!state.isVerified ? (
                    <div className="space-y-4">
                      {state.eventType === "solo" ? (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Enter your Delegate ID
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={state.inputIds[0]}
                              onChange={(e) => setItemStates(prev => ({
                                ...prev,
                                [event.eventId]: {
                                  ...prev[event.eventId],
                                  inputIds: [e.target.value.toUpperCase()]
                                }
                              }))}
                              placeholder="XXX-XXXXX-XXXXX"
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black "
                            />
                            <button
                              onClick={() => handleSoloVerify(event.eventId)}
                              disabled={!state.inputIds[0] || state.isVerifying}
                              className="px-6 py-2 bg-black text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                            >
                              {state.isVerifying ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Enter Delegate IDs for Group Members (Min: {state.minTeamSize}, Max: {state.maxTeamSize})
                          </label>
                          {state.inputIds.map((id, index) => (
                            <div key={index} className="flex gap-3 mb-3">
                              <input
                                type="text"
                                value={id}
                                onChange={(e) => setItemStates(prev => {
                                  const newInputs = [...prev[event.eventId].inputIds];
                                  newInputs[index] = e.target.value.toUpperCase();
                                  return {
                                    ...prev,
                                    [event.eventId]: { ...prev[event.eventId], inputIds: newInputs }
                                  };
                                })}
                                placeholder={index === 0 ? "Member 1 ID (Lead)" : `Member ${index + 1} ID`}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black "
                              />
                              {state.inputIds.length > state.minTeamSize && (
                                <button
                                  onClick={() => handleRemoveGroupMember(event.eventId, index)}
                                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  Drop
                                </button>
                              )}
                            </div>
                          ))}
                          
                          <div className="flex gap-3 mt-4">
                            {state.inputIds.length < state.maxTeamSize && (
                              <button
                                onClick={() => handleAddGroupMember(event.eventId)}
                                className="px-4 py-2 text-zinc-600 border rounded-lg hover:bg-zinc-50 "
                              >
                                + Add Member
                              </button>
                            )}
                            <button
                              onClick={() => handleGroupVerify(event.eventId)}
                              className="px-6 py-2 bg-black text-white rounded-lg font-medium ml-auto"
                            >
                              Confirm Team
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-green-700 font-semibold flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified Participants
                        </span>
                        <button
                          onClick={() => resetVerification(event.eventId)}
                          className="text-sm text-zinc-500 hover:text-zinc-700 underline"
                        >
                          Change IDs
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {state.participants.map((p, i) => (
                          <li key={i} className="text-sm text-zinc-800 ">
                            <span className="font-medium">{p?.name}</span> {i === 0 && "(Lead)"} ({p?.id}) - {p?.collegeName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {allVerified && (
            <form onSubmit={handleCheckout} className="bg-white border border-zinc-200 rounded-xl overflow-hidden mt-8">
              <div className="p-6 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                <span className="text-xl font-medium">Grand Total</span>
                <span className="text-3xl font-bold">
                  ₹{cart.reduce((total, event) => total + event.fee, 0)}
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                  <p className="text-sm text-zinc-600 mb-4">Please scan the QR code below to pay the grand total, then upload the screenshot and enter the UTR number.</p>
                  
                  <div className="mb-6 flex justify-center">
                    <Image 
                      src={process.env.NEXT_PUBLIC_SPORTS_PAYMENT_QR_IMAGE_PATH || "/qr-code.webp"} 
                      alt="Payment QR" 
                      width={192}
                      height={192}
                      priority={false}
                      className="border rounded-lg shadow-sm object-contain"
                    />
                  </div>

                  {checkoutError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                      {checkoutError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        UTR Number (12-22 alphanumeric characters)
                      </label>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. ABC123456789"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black "
                        pattern="[A-Za-z0-9]{12,22}"
                      />
                    </div>
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
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-black rounded-lg hover:bg-zinc-800 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
