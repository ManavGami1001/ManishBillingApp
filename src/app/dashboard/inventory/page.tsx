import React from "react";
import { getProducts } from "./actions";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { ProductTableRow } from "@/components/inventory/product-table-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InventoryPage() {
  const products = await getProducts();
  
  // Mapped over 'products' instead of 'rawProducts'
  const serializedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    stock: Number(p.stock)
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your product catalog and stock levels.</p>
        </div>
        <AddProductDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>A list of all products in your tenant's inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {serializedProducts.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No products found. Add one to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="text-right w-[150px]">Stock</TableHead>
                    <TableHead className="text-right w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serializedProducts.map((product) => (
                    <ProductTableRow key={product.id} product={product} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}