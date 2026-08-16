import React from "react";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getSuppliers, deleteSupplier } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";

export default async function SuppliersPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return notFound();
  }

  const suppliers = await getSuppliers();

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Suppliers</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your supplier network and purchase orders.</p>
        </div>
        <AddSupplierDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>A list of all suppliers configured for your tenant.</CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No suppliers found. Add one to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
            <div className="w-full overflow-x-auto pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead className="text-right w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson || "-"}</TableCell>
                      <TableCell>{supplier.phone || "-"}</TableCell>
                      <TableCell>{supplier.gstin || "-"}</TableCell>
                      <TableCell className="text-right">
                        <form action={deleteSupplier.bind(null, supplier.id)}>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
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
