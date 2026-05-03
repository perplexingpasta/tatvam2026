"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MerchItem } from "@/types/merch";
import { useMerchCart } from "@/components/MerchCartProvider";
import { toast } from "sonner";

export function MerchItemCard({ item }: { item: MerchItem }) {
  const { addMerchUnit } = useMerchCart();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCustomising, setIsCustomising] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBuyAnother, setShowBuyAnother] = useState(false);

  // Reset form
  const resetForm = () => {
    setAttributes({});
    setErrors({});
    setShowSuccess(false);
    setShowBuyAnother(false);
  };

  const handleAttributeChange = (id: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [id]: value }));
    // Clear error when typing
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleAddToCart = () => {
    // Validate
    const newErrors: Record<string, string> = {};
    item.attributes.forEach((attr) => {
      if (attr.required && (!attributes[attr.id] || attributes[attr.id].trim() === "")) {
        newErrors[attr.id] = `${attr.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add to cart
    addMerchUnit({
      unitId: crypto.randomUUID(),
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      attributes: { ...attributes },
    });

    toast.success(`${item.name} added to cart`);

    setShowSuccess(true);
    setShowBuyAnother(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Image Gallery */}
      <div className="relative w-full aspect-square bg-gray-100">
        {item.images.length > 0 ? (
          <Image
            src={item.images[currentImageIndex]}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No image
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {item.images.length > 1 && (
        <div className="flex p-2 gap-2 overflow-x-auto border-b border-gray-100">
          {item.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 ${
                currentImageIndex === idx ? "border-blue-600" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${item.name} thumbnail ${idx + 1}`} fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
          <span className="text-lg font-semibold text-gray-900">₹{item.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-1">{item.description}</p>

        {!item.isAvailable ? (
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Unavailable
            </span>
            <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md font-medium cursor-not-allowed">
              Add to Cart
            </button>
          </div>
        ) : (
          <div className="mt-auto">
            {!isCustomising ? (
              <button
                onClick={() => setIsCustomising(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Customise & Add to Cart
              </button>
            ) : (
              <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Customise</h4>
                  <button 
                    onClick={() => {
                      setIsCustomising(false);
                      resetForm();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                
                {item.attributes.map((attr) => (
                  <div key={attr.id} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {attr.label} {attr.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {attr.type === "select" ? (
                      <select
                        value={attributes[attr.id] || ""}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors[attr.id] ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="" disabled>Select {attr.label}</option>
                        {attr.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={attr.type === "number" ? "number" : "text"}
                        placeholder={attr.placeholder}
                        value={attributes[attr.id] || ""}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                          errors[attr.id] ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    )}
                    {errors[attr.id] && (
                      <p className="text-xs text-red-600">{errors[attr.id]}</p>
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  {!showBuyAnother ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => resetForm()}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-md font-medium transition-colors"
                    >
                      Buy Another
                    </button>
                  )}
                  
                  {showSuccess && (
                    <p className="text-sm text-green-600 text-center mt-2 font-medium">
                      Added to cart!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
