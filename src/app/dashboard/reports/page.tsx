import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return notFound();
  }

  // Get start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: session.user.tenantId,
      createdAt: {
        gte: startOfMonth,
      }
    },
    include: {
      items: true
    },
  });

  let totalRevenue = 0;
  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalCost = 0;

  invoices.forEach(invoice => {
    totalRevenue += Number(invoice.grandTotal);
    totalTaxableValue += Number(invoice.subTotal);
    totalCgst += Number(invoice.totalCgst);
    totalSgst += Number(invoice.totalSgst);

    invoice.items.forEach(item => {
      totalCost += Number(item.quantity) * Number(item.costPrice);
    });
  });

  const totalGstCollected = totalCgst + totalSgst;
  const totalGrossProfit = totalTaxableValue - totalCost;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">View sales, inventory, and GST compliance reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api/export/reports/excel">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Key metrics for the current month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Taxable Value</p>
                <p className="text-2xl font-bold mt-2">₹{totalTaxableValue.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <p className="text-sm font-medium text-muted-foreground">Total GST Collected</p>
                <p className="text-2xl font-bold mt-2">₹{totalGstCollected.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Gross Profit</p>
                <p className="text-2xl font-bold mt-2">₹{totalGrossProfit.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GST Liability (GSTR-1 Summary)</CardTitle>
            <CardDescription>Summary of outward supplies for filing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto pb-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Total Taxable Value</TableHead>
                  <TableHead>Total CGST</TableHead>
                  <TableHead>Total SGST</TableHead>
                  <TableHead>Total IGST</TableHead>
                  <TableHead className="text-right">Total Invoice Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>₹{totalTaxableValue.toFixed(2)}</TableCell>
                  <TableCell>₹{totalCgst.toFixed(2)}</TableCell>
                  <TableCell>₹{totalSgst.toFixed(2)}</TableCell>
                  <TableCell>₹0.00</TableCell>
                  <TableCell className="text-right font-medium">₹{totalRevenue.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
