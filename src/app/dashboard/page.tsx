import React from "react";
import { Package, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-red-500 font-medium">
        Error: Unauthorized or missing Tenant ID. Please log in again.
      </div>
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Today's Sales
  const todaysSalesResult = await prisma.invoice.aggregate({
    _sum: {
      grandTotal: true,
    },
    where: {
      tenantId,
      createdAt: {
        gte: startOfToday,
      },
    },
  });
  const todaysSales = Number(todaysSalesResult._sum.grandTotal || 0).toFixed(2);

  // Pending e-Way Bills
  const pendingEWayBills = await prisma.invoice.count({
    where: {
      tenantId,
      grandTotal: {
        gte: 50000,
      },
      ewayBillNo: null,
    },
  });

  // Low Stock Alerts
  const lowStockAlerts = await prisma.product.count({
    where: {
      tenantId,
      stock: {
        lte: 10,
      },
    },
  });

  async function handleQuickBilling(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;
    if (search) {
      redirect(`/dashboard/billing?search=${encodeURIComponent(search)}`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of your retail POS and ERP metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api/export/sales">
            <Button variant="outline">Export Data</Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button>Generate Report</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Sales */}
        <Link href="/dashboard/stats">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {todaysSales}</div>
              <p className="text-xs text-muted-foreground">Generated today</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending e-Way Bills */}
        <Link href="/dashboard/billing">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending e-Way Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEWayBills}</div>
              <p className="text-xs text-muted-foreground">Requires immediate generation</p>
            </CardContent>
          </Card>
        </Link>

        {/* Low Stock Alerts */}
        <Link href="/dashboard/inventory">
          <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockAlerts} {lowStockAlerts === 1 ? 'Item' : 'Items'}</div>
              <p className="text-xs text-muted-foreground">Needs reordering</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Quick Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleQuickBilling} className="flex gap-2 max-w-md">
              <Input type="text" name="search" placeholder="Search Product Name" required />
              <Button type="submit">Start Billing</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
