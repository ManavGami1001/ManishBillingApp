"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  return prisma.supplier.findMany({
    where: {
      tenantId: session.user.tenantId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSupplier(data: {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  address?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.supplier.create({
    data: {
      name: data.name,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      gstin: data.gstin || null,
      address: data.address || null,
      tenant: { connect: { id: session.user.tenantId } },
    },
  });

  revalidatePath("/dashboard/suppliers");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  await prisma.supplier.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
    },
    data: {
      isArchived: true,
    },
  });

  revalidatePath("/dashboard/suppliers");
  return { success: true };
}
