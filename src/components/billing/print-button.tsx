"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileDown, Share2 } from "lucide-react";

export function InvoiceActions() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invoice',
          text: 'Here is your invoice',
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        Save as PDF
      </Button>
      <Button onClick={() => window.print()} className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Print
      </Button>
    </div>
  );
}
