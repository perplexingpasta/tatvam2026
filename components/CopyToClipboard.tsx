"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyToClipboardProps {
  text: string;
  className?: string;
  showText?: boolean;
}

export function CopyToClipboard({ text, className = "", showText = true }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 cursor-pointer font-mono text-sm bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors ${className}`}
      onClick={handleCopy}
      title="Click to copy"
    >
      {showText && <span>{text}</span>}
      {copied ? (
        <Check size={14} className="text-green-600" />
      ) : (
        <Copy size={14} className="text-gray-500 hover:text-gray-700" />
      )}
    </span>
  );
}
