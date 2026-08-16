"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export async function getGstRate(hsnCode: string | null | undefined) {
  if (!hsnCode) return { cgst: 9, sgst: 9 };
  if (hsnCode.startsWith("1")) return { cgst: 2.5, sgst: 2.5 };
  if (hsnCode.startsWith("2")) return { cgst: 6, sgst: 6 };
  if (hsnCode.startsWith("3")) return { cgst: 14, sgst: 14 };
  return { cgst: 9, sgst: 9 };
}

export async function processCheckout(payload: {
  cart: Array<{ productId: string; quantity: number; price: number; costPrice: number; total: number; cgstRate: number; sgstRate: number }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  costPrice: number | string;
  grandTotal: number;
}) {
  const session = await auth();

  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { tenantId, id: userId } = session.user;

  // Generate a rudimentary invoice number (in production, use sequences or DB triggers)
  const invoiceNumber = `INV-${Date.now()}`;

  // Execute inside a transaction to ensure all-or-nothing processing
  const invoice = await prisma.$transaction(async (tx) => {
    // 1. Create the Invoice record
    const newInvoice = await tx.invoice.create({
      data: {
        tenantId,
        userId,
        invoiceNumber,
        subTotal: new Prisma.Decimal(payload.subtotal),
        totalCgst: new Prisma.Decimal(payload.cgst),
        totalSgst: new Prisma.Decimal(payload.sgst),
        totalIgst: new Prisma.Decimal(0),
        grandTotal: new Prisma.Decimal(payload.grandTotal),
        // 2. Create nested InvoiceItem records
        items: {
          create: payload.cart.map((item) => ({
            productId: item.productId,
            quantity: new Prisma.Decimal(item.quantity),
            price: new Prisma.Decimal(item.price),
            costPrice: new Prisma.Decimal(item.costPrice),
            cgstRate: new Prisma.Decimal(item.cgstRate),
            sgstRate: new Prisma.Decimal(item.sgstRate),
            igstRate: new Prisma.Decimal(0),
          })),
        },
      },
    });

    // 3. Decrement stock counts safely
    for (const item of payload.cart) {
      // Find the current product to check stock first
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.tenantId !== tenantId) {
        throw new Error(`Product ${item.productId} not found or unauthorized`);
      }

      const currentStock = Number(product.stock);
      if (currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${currentStock}, Requested: ${item.quantity}`
        );
      }

      await tx.product.update({
        where: { 
          id: item.productId,
          stock: { gte: item.quantity }
        },
        data: {
          stock: { decrement: new Prisma.Decimal(item.quantity) },
        },
      });
    }

    return newInvoice;
  });

  return { success: true, invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };
}
