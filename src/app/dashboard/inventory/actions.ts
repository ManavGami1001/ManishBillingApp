"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getProducts() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  return prisma.product.findMany({
    where: { 
      tenantId: session.user.tenantId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(data: {
  name: string;
  sku?: string | null;
  hsnCode?: string | null;
  price: number;
  costPrice: number;
  gstRate: number;
  stock: number;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku || null,
      hsnCode: data.hsnCode || null,
      price: new Prisma.Decimal(data.price),
      costPrice: new Prisma.Decimal(data.costPrice),
      gstRate: new Prisma.Decimal(data.gstRate),
      stock: data.stock,
      tenant: { connect: { id: session.user.tenantId } },
    },
  });

  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.product.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId, // Ensure tenant owns this product
    },
    data: {
      isArchived: true,
    }
  });

  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function updateProductStock(id: string, newStock: number) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.product.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
    },
    data: {
      stock: new Prisma.Decimal(newStock),
    },
  });

  revalidatePath("/dashboard/inventory");
  return { success: true };
}