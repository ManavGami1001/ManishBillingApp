"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { processCheckout, getGstRate } from "@/app/dashboard/billing/actions";
import { useRouter } from "next/navigation";

// Define a safe product type since Prisma.Decimal is serialized to string across the boundary
type Product = {
  id: string;
  name: string;
  hsnCode?: string | null;
  price: number | string;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  total: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
};

export function POSInterface({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  // Filter products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to parse decimal safely
  const getPrice = (price: any) => Number(price) || 0;

  const addToCart = async (product: Product) => {
    if (product.stock <= 0) {
      setShakeId(product.id);
      setTimeout(() => setShakeId(null), 500);
      return;
    }

    setIsProcessing(true);
    try {
      const { cgst, sgst } = await getGstRate(product.hsnCode);
      const totalGstRate = cgst + sgst;
      
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) => {
            if (item.product.id === product.id) {
              const newQuantity = item.quantity + 1;
              const newTotal = Number((newQuantity * getPrice(product.price)).toFixed(2));
              const taxableValue = newTotal / (1 + (totalGstRate / 100));
              const totalGstAmount = newTotal - taxableValue;
              
              return {
                ...item,
                quantity: newQuantity,
                total: newTotal,
                cgstAmount: Number((totalGstAmount / 2).toFixed(2)),
                sgstAmount: Number((totalGstAmount / 2).toFixed(2)),
              };
            }
            return item;
          });
        }
        
        const total = getPrice(product.price);
        const taxableValue = total / (1 + (totalGstRate / 100));
        const totalGstAmount = total - taxableValue;
        
        return [
          ...prev,
          {
            product,
            quantity: 1,
            total: Number(total.toFixed(2)),
            cgstRate: cgst,
            sgstRate: sgst,
            cgstAmount: Number((totalGstAmount / 2).toFixed(2)),
            sgstAmount: Number((totalGstAmount / 2).toFixed(2)),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to fetch GST rate", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            const newTotal = Number((newQuantity * getPrice(item.product.price)).toFixed(2));
            const totalGstRate = item.cgstRate + item.sgstRate;
            const taxableValue = newTotal / (1 + (totalGstRate / 100));
            const totalGstAmount = newTotal - taxableValue;
            
            return {
              ...item,
              quantity: newQuantity,
              total: newTotal,
              cgstAmount: Number((totalGstAmount / 2).toFixed(2)),
              sgstAmount: Number((totalGstAmount / 2).toFixed(2)),
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

  // Calculations rounded carefully
  const grandTotal = useMemo(() => Number(cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)), [cart]);
  const cgstTotal = useMemo(() => Number(cart.reduce((sum, item) => sum + item.cgstAmount, 0).toFixed(2)), [cart]);
  const sgstTotal = useMemo(() => Number(cart.reduce((sum, item) => sum + item.sgstAmount, 0).toFixed(2)), [cart]);
  const subtotal = Number((grandTotal - cgstTotal - sgstTotal).toFixed(2));

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
          cgstRate: c.cgstRate,
          sgstRate: c.sgstRate,
        })),
        subtotal,
        cgst: cgstTotal,
        sgst: sgstTotal,
        grandTotal,
      };

      const result = await processCheckout(payload as any);
      
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
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-full lg:h-[calc(100vh-140px)]">
      {/* Left Column: Product List */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
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
                  style={{
                    transform: shakeId === product.id ? "translateX(5px) rotate(1deg)" : "none",
                    transition: "transform 0.1s ease-in-out"
                  }}
                  className={`group relative rounded-lg border p-4 transition-colors ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <h3 className="font-semibold text-sm truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium">₹{getPrice(product.price).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${shakeId === product.id || product.stock <= 0 ? 'text-red-500 font-bold bg-red-50' : 'text-muted-foreground bg-slate-100 dark:bg-slate-800'}`}>
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
                        ₹{getPrice(item.product.price).toFixed(2)} / unit (+{item.cgstRate + item.sgstRate}% GST)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 lg:h-7 lg:w-7 rounded-full"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={isProcessing}
                      >
                        <Minus className="h-4 w-4 lg:h-3 lg:w-3" />
                      </Button>
                      <span className="w-8 text-center text-base lg:text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 lg:h-7 lg:w-7 rounded-full"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={isProcessing}
                      >
                        <Plus className="h-4 w-4 lg:h-3 lg:w-3" />
                      </Button>
                      <div className="w-20 text-right font-medium text-base lg:text-sm">
                        ₹{item.total.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 lg:h-7 lg:w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 ml-2"
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
              <span className="text-muted-foreground">Total CGST</span>
              <span className="font-medium">₹{cgstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total SGST</span>
              <span className="font-medium">₹{sgstTotal.toFixed(2)}</span>
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
