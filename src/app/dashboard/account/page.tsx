import React from "react";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AccountSettingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your personal account details and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={user.username || ""} disabled />
            <p className="text-xs text-slate-500">Your username is unique and cannot be changed.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email || ""} disabled />
            <p className="text-xs text-slate-500">Your email address is used for important notifications.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role || "User"} disabled />
          </div>

          <div className="pt-4">
            <Button disabled>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
