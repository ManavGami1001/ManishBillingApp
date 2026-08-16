import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return notFound();
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { 
      id,
      tenantId: session.user.tenantId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!invoice) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/invoices">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        <Button className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Tax Invoice</CardTitle>
              <CardDescription className="mt-1">
                Invoice Number: <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
              </CardDescription>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm text-muted-foreground">Date of Issue</div>
              <div className="font-medium">{invoice.createdAt.toLocaleDateString()}</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Billed To:</h3>
            <p className="font-semibold text-lg">{invoice.customerName || "Walk-in Customer"}</p>
          </div>

          <div className="rounded-md border w-full overflow-x-auto pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                    <TableCell className="text-right">₹{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{(Number(item.quantity) * Number(item.price)).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>Subtotal:</span>
              <span>₹{Number(invoice.subTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>CGST:</span>
              <span>₹{Number(invoice.totalCgst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-muted-foreground border-b pb-2">
              <span>SGST:</span>
              <span>₹{Number(invoice.totalSgst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-lg pt-1">
              <span>Grand Total:</span>
              <span>₹{Number(invoice.grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
