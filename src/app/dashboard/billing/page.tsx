import React from "react";
import { POSInterface } from "@/components/billing/pos-interface";
import { prisma } from "@/lib/prisma"; 
import { auth } from "@/auth";

export default async function BillingPage() {
  // Fetch session to get the current user's tenant ID
  const session = await auth();
  const userTenantId = session?.user?.tenantId;

  // Prevent a crash if the user isn't logged in or lacks a tenant ID
  if (!userTenantId) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-red-500 font-medium">
        Error: Unauthorized or missing Tenant ID. Please log in again.
      </div>
    );
  }

  // Query products isolated to this tenant
  const products = await prisma.product.findMany({
    where: { 
      tenantId: userTenantId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map the products to match the expected Product type in POSInterface.
  // Both price and stock are Prisma Decimals, which Next.js will refuse to pass to Client Components.
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    costPrice: p.costPrice.toString(),
    gstRate: p.gstRate.toString(),
    stock: Number(p.stock), 
  }));

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Billing POS
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create new invoices and manage cart items.
          </p>
        </div>
      </div>
      
      {/* 
        The POSInterface manages all state (cart, search, totals)
        and layout for the billing workflow.
      */}
      <POSInterface products={serializedProducts} />
    </div>
  );
}