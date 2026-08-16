import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsTabs } from "./settings-tabs";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id || !session?.user?.tenantId) {
    return <div>Not authenticated</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  if (!user || !tenant) {
    return <div>Store not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Store Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your business and store configuration.</p>
      </div>

      <SettingsTabs user={user} tenant={tenant} />
    </div>
  );
}
