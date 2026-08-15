"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getProducts() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  const products = await prisma.product.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  hsnCode: string;
  price: number;
  stock: number;
}) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku || null,
      hsnCode: data.hsnCode || null,
      price: new Prisma.Decimal(data.price),
      stock: data.stock,
      tenantId: session.user.tenantId,
    },
  });

  revalidatePath("/dashboard/inventory");
  return product;
}
