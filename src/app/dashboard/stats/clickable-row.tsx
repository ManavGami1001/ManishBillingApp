"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";

export function ClickableInvoiceRow({ invoice }: { invoice: any }) {
  const router = useRouter();
  return (
    <TableRow 
      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">₹{Number(invoice.grandTotal).toFixed(2)}</TableCell>
    </TableRow>
  );
}
