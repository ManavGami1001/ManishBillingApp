"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  return prisma.invoice.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteInvoice(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id, tenantId: session.user.tenantId },
      include: { items: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    for (const item of invoice.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.invoice.delete({ where: { id } });
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/reports");
}