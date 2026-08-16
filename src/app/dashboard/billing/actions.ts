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
  cart: Array<{ productId: string; quantity: number }>;
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
    
    let serverSubtotal = new Prisma.Decimal(0);
    let serverTotalCgst = new Prisma.Decimal(0);
    let serverTotalSgst = new Prisma.Decimal(0);
    let serverGrandTotal = new Prisma.Decimal(0);

    const itemsToCreate = [];

    // 1. Validate stock, fetch exact prices, and calculate totals securely
    for (const item of payload.cart) {
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

      // Calculate totals using Prisma.Decimal methods
      const qty = new Prisma.Decimal(item.quantity);
      const itemPrice = new Prisma.Decimal(product.price as Prisma.Decimal.Value);
      const itemTotal = qty.mul(itemPrice);
      
      const gstRate = new Prisma.Decimal(product.gstRate as Prisma.Decimal.Value);
      const one = new Prisma.Decimal(1);
      const hundred = new Prisma.Decimal(100);
      const divisor = one.add(gstRate.div(hundred));
      
      const taxableValue = itemTotal.div(divisor);
      const totalGstAmount = itemTotal.sub(taxableValue);
      const halfGstAmount = totalGstAmount.div(new Prisma.Decimal(2));

      serverSubtotal = serverSubtotal.add(taxableValue);
      serverTotalCgst = serverTotalCgst.add(halfGstAmount);
      serverTotalSgst = serverTotalSgst.add(halfGstAmount);
      serverGrandTotal = serverGrandTotal.add(itemTotal);

      itemsToCreate.push({
        productId: product.id,
        quantity: qty,
        price: product.price,
        costPrice: product.costPrice,
        gstRate: product.gstRate,
        cgstRate: gstRate.div(new Prisma.Decimal(2)),
        sgstRate: gstRate.div(new Prisma.Decimal(2)),
        igstRate: new Prisma.Decimal(0),
      });

      // Decrement stock safely
      await tx.product.update({
        where: { 
          id: item.productId,
          stock: { gte: item.quantity }
        },
        data: {
          stock: { decrement: qty },
        },
      });
    }

    // 2. Create the Invoice record with server-calculated totals
    const newInvoice = await tx.invoice.create({
      data: {
        tenantId,
        userId,
        invoiceNumber,
        subTotal: serverSubtotal,
        totalCgst: serverTotalCgst,
        totalSgst: serverTotalSgst,
        totalIgst: new Prisma.Decimal(0),
        grandTotal: serverGrandTotal,
        // 3. Create nested InvoiceItem records
        items: {
          create: itemsToCreate,
        },
      },
    });

    return newInvoice;
  });

  return { success: true, invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };
}
