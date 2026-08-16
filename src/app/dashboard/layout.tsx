import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React from "react";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold tracking-tight">Aavak.io Dashboard</h1>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
