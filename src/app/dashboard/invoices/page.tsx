import React from "react";
import { DeleteButton } from "./delete-button";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getInvoices, deleteInvoice } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return notFound();
  }

  const invoices = await getInvoices();

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Invoice History</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage past invoices.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>A chronological list of all generated invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No invoices found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
            <div className="w-full overflow-x-auto pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.customerName || "Walk-in"}</TableCell>
                      <TableCell>₹{Number(invoice.grandTotal).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteButton id={invoice.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
