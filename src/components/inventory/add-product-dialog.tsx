"use client";

import { buttonVariants } from "@/components/ui/button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/app/dashboard/inventory/actions";
import { PackagePlus } from "lucide-react";

export function AddProductDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    hsnCode: "",
    price: "",
    costPrice: "",
    gstRate: "18",
    stock: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createProduct({
        name: formData.name,
        sku: formData.sku,
        hsnCode: formData.hsnCode,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice || "0"),
        gstRate: parseFloat(formData.gstRate || "18"),
        stock: parseInt(formData.stock, 10),
      });

      setOpen(false);
      setFormData({ name: "", sku: "", hsnCode: "", price: "", costPrice: "", gstRate: "18", stock: "" });
      router.refresh(); // Refresh the current route to fetch new data
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        Add Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the product details to add it to your inventory. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Product Name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">
                  SKU
                </label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="SKU-123"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="hsnCode" className="text-sm font-medium">
                  HSN Code
                </label>
                <Input
                  id="hsnCode"
                  name="hsnCode"
                  placeholder="123456"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Selling Price / MRP (₹)
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="costPrice" className="text-sm font-medium">
                  Cost Price (₹)
                </label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="gstRate" className="text-sm font-medium">
                  GST Rate (%)
                </label>
                <Input
                  id="gstRate"
                  name="gstRate"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="18"
                  value={formData.gstRate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Stock
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
