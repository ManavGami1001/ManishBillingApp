import React from "react";
import { getProducts } from "@/app/dashboard/inventory/actions";
import { POSInterface } from "@/components/billing/pos-interface";

export default async function BillingPage() {
  const products = await getProducts();

  // Map the products to match the expected Product type in POSInterface
  // Prisma.Decimal needs to be converted if passing to a client component directly
  // However, Next.js can serialize decimal if we just pass the raw objects, or we can convert it here.
  // We'll safely map price to a string to avoid client component serialization errors with Prisma.Decimal.
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
  }));

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Billing POS</h1>
          <p className="text-slate-500 dark:text-slate-400">Create new invoices and manage cart items.</p>
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
