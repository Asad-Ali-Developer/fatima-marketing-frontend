"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Inside your component
const InvoiceNumberCell = ({ invoice_number }: { invoice_number?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!invoice_number) return;

    navigator.clipboard.writeText(invoice_number);
    setCopied(true);

    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  if (!invoice_number) {
    return (
      <td className="px-6 py-4">
        <span className="text-sm text-slate-500">—</span>
      </td>
    );
  }

  return (
    <td className="px-6 py-4 font-medium">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 truncate w-[120px]">
          {invoice_number}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B7E8]"
          aria-label="Copy invoice number"
        >
          {copied ? (
            <Check className="w-4 h-4 font-medium text-[#00B7E8]" />
          ) : (
            <Copy className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          )}
        </button>
      </div>
    </td>
  );
};

export default InvoiceNumberCell