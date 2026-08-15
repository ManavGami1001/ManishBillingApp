"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { processCheckout } from "@/app/dashboard/billing/actions";
import { useRouter } from "next/navigation";

// Define a safe product type since Prisma.Decimal is serialized to string across the boundary
type Product = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  total: number;
};

export function POSInterface({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to parse decimal safely
  const getPrice = (price: any) => Number(price) || 0;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * getPrice(product.price),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          total: getPrice(product.price),
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            return {
              ...item,
              quantity: newQuantity,
              total: newQuantity * getPrice(item.product.price),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0) // Automatically remove if quantity hits 0
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);
  const cgst = subtotal * 0.09; // 9%
  const sgst = subtotal * 0.09; // 9%
  const grandTotal = subtotal + cgst + sgst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        cart: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          price: getPrice(c.product.price),
          total: c.total,
        })),
        subtotal,
        cgst,
        sgst,
        grandTotal,
      };

      const result = await processCheckout(payload);
      
      if (result.success) {
        setCart([]); // Clear cart
        router.push("/dashboard/invoices/" + result.invoiceId);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Product List */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Products</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => !isProcessing && addToCart(product)}
                  className={`group relative rounded-lg border p-4 transition-colors ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <h3 className="font-semibold text-sm truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">₹{getPrice(product.price).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No products found.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Column: Cart Summary */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Current Order
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {error && (
              <div className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            
            {cart.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                Cart is empty. Select products to begin billing.
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-4">
                    <div className="flex-1 overflow-hidden pr-2">
                      <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        ₹{getPrice(item.product.price).toFixed(2)} / unit
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={isProcessing}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={isProcessing}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <div className="w-16 text-right font-medium text-sm">
                        ₹{item.total.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => removeFromCart(item.product.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex-col border-t bg-slate-50 dark:bg-slate-900 p-4 gap-4">
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST (9%)</span>
              <span className="font-medium">₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SGST (9%)</span>
              <span className="font-medium">₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full h-12 text-lg" 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
