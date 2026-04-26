"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import { useState } from "react";

interface ParticipantDetails {
  id: string;
  name: string;
  yearOfStudy: string;
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
  error: string | null;
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [itemStates, setItemStates] = useState<Record<string, CartItemState>>({});
  
  // Checkout state
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

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
  };

  const allVerified = cart.length > 0 && cart.every(event => itemStates[event.eventId]?.isVerified);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allVerified) {
      setCheckoutError("Please verify all delegates for all events before checking out.");
      return;
    }
    if (!utrNumber || !paymentScreenshot) {
      setCheckoutError("Please provide both UTR number and payment screenshot.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    const formData = new FormData();
    formData.append("utrNumber", utrNumber);
    formData.append("paymentScreenshot", paymentScreenshot);

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

    try {
      const res = await fetch("/api/registration/events", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCheckoutSuccess(true);
        clearCart();
        setItemStates({});
      } else {
        setCheckoutError(data.message || "An error occurred during checkout.");
      }
    } catch {
      setCheckoutError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-12">
          <div className="text-green-600 dark:text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Registration Submitted!</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Your event registration has been received. We are verifying your payment.
            A confirmation email has been sent to the lead delegate.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 border rounded-xl border-dashed">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">Your cart is empty.</p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-white transition duration-200 bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
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
                <div key={event.eventId} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-6 relative">
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
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
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
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-zinc-900"
                            />
                            <button
                              onClick={() => handleSoloVerify(event.eventId)}
                              disabled={!state.inputIds[0]}
                              className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium disabled:opacity-50"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-zinc-900"
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
                                className="px-4 py-2 text-zinc-600 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              >
                                + Add Member
                              </button>
                            )}
                            <button
                              onClick={() => handleGroupVerify(event.eventId)}
                              className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium ml-auto"
                            >
                              Confirm Team
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-green-700 dark:text-green-400 font-semibold flex items-center gap-2">
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
                          <li key={i} className="text-sm text-zinc-800 dark:text-zinc-200">
                            <span className="font-medium">{p?.name}</span> {i === 0 && "(Lead)"} ({p?.id}) - {p?.yearOfStudy} Year
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
            <form onSubmit={handleCheckout} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-8">
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
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
                    <img 
                      src={process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_PATH || "/qr-code.webp"} 
                      alt="Payment QR" 
                      className="w-48 h-48 border rounded-lg shadow-sm"
                    />
                  </div>

                  {checkoutError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                      {checkoutError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        UTR Number (12-22 alphanumeric characters)
                      </label>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. ABC123456789"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-zinc-900"
                        pattern="[A-Za-z0-9]{12,22}"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Payment Screenshot (Max 10MB)
                      </label>
                      <input
                        type="file"
                        required
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-70"
                  >
                    {isSubmitting ? "Processing..." : "Complete Registration"}
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
