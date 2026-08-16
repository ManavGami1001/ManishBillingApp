"use client";

import React, { useTransition } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateProductStock, deleteProduct } from "@/app/dashboard/inventory/actions";

export function ProductTableRow({ product }: { product: any }) {
  const [isPending, startTransition] = useTransition();

  const handleStockChange = (delta: number) => {
    startTransition(() => {
      updateProductStock(product.id, Number(product.stock) + delta);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      startTransition(() => {
        deleteProduct(product.id);
      });
    }
  };

  return (
    <TableRow className={isPending ? "opacity-50" : ""}>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.sku || "-"}</TableCell>
      <TableCell>{product.hsnCode || "-"}</TableCell>
      <TableCell className="text-right">{Number(product.price).toFixed(2)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleStockChange(-1)}
            disabled={isPending}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{Number(product.stock)}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleStockChange(1)}
            disabled={isPending}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
