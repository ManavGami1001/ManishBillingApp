import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceActions } from "@/components/billing/print-button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Next.js standard params for dynamic route
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return notFound();
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      tenant: true, // We want to display the Tenant Name on the invoice
    },
  });

  // Verify the invoice exists and belongs to the authenticated tenant
  if (!invoice || invoice.tenantId !== session.user.tenantId) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      {/* Action Bar - Hidden during print */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Invoice Details</h1>
        <InvoiceActions />
      </div>

      {/* Invoice Printable Area */}
      <div className="bg-white p-10 border rounded-lg shadow-sm print:shadow-none print:border-none print:p-0 text-slate-900">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold">{invoice.tenant.name}</h2>
            {invoice.tenant.address && <p className="text-slate-500">{invoice.tenant.address}</p>}
            {invoice.tenant.phone && <p className="text-slate-500">{invoice.tenant.phone}</p>}
            {invoice.tenant.gstin && (
              <p className="text-sm font-medium mt-1">GSTIN: {invoice.tenant.gstin}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-semibold text-slate-400">INVOICE</h3>
            <p className="text-sm font-medium mt-2">Invoice #: {invoice.invoiceNumber}</p>
            <p className="text-sm text-slate-500">Date: {invoice.date.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details (Optional/Mocked) */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
          <p className="font-medium">{invoice.customerName || "Walk-in Customer"}</p>
          {invoice.customerState && <p className="text-sm text-slate-600">{invoice.customerState}</p>}
          {invoice.customerGstin && <p className="text-sm text-slate-600">GSTIN: {invoice.customerGstin}</p>}
        </div>

        {/* Line Items Table */}
        <div className="mb-8 rounded-md border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate (₹)</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.product.name}</div>
                    {item.product.hsnCode && (
                      <div className="text-xs text-slate-500">HSN: {item.product.hsnCode}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                  <TableCell className="text-right">{item.price.toString()}</TableCell>
                  <TableCell className="text-right">
                    {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">₹{invoice.subTotal.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">CGST</span>
              <span className="font-medium">₹{invoice.totalCgst.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">SGST</span>
              <span className="font-medium">₹{invoice.totalSgst.toString()}</span>
            </div>
            
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
              <span>Grand Total</span>
              <span>₹{invoice.grandTotal.toString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
          <p>Thank you for your business!</p>
          <p className="mt-1 text-xs">This is a computer generated invoice and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
}
