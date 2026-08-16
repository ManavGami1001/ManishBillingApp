"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const username = formData.get("username") as string;
  const email = formData.get("email") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username, email },
  });

  revalidatePath("/dashboard/settings");
}

export async function updateStore(formData: FormData) {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const gstin = formData.get("gstin") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: { name, gstin, address, phone },
  });

  revalidatePath("/dashboard/settings");
}
