"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateAccount, updateStore } from "./actions";

export function SettingsTabs({ user, tenant }: { user: any, tenant: any }) {
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);

  // Controlled states for Account
  const [accountForm, setAccountForm] = useState({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "",
  });

  // Controlled states for Store
  const [storeForm, setStoreForm] = useState({
    name: tenant.name || "",
    gstin: tenant.gstin || "",
    address: tenant.address || "",
    phone: tenant.phone || "",
  });

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleAccountSave(formData: FormData) {
    setIsSaving(true);
    await updateAccount(formData);
    setIsSaving(false);
  }

  async function handleStoreSave(formData: FormData) {
    setIsSaving(true);
    await updateStore(formData);
    setIsSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex gap-4 border-b pb-2">
        <button 
          type="button"
          className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'account' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button 
          type="button"
          className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'store' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('store')}
        >
          Store
        </button>
      </div>

      {activeTab === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your personal account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleAccountSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={accountForm.username} onChange={handleAccountChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={accountForm.email} onChange={handleAccountChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" value={accountForm.role} disabled />
              </div>
              <div className="pt-4">
                <Button type="submit" disabled={isSaving}>Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'store' && (
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Update your business and store configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleStoreSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" name="name" value={storeForm.name} onChange={handleStoreChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" name="gstin" value={storeForm.gstin} onChange={handleStoreChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={storeForm.address} onChange={handleStoreChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={storeForm.phone} onChange={handleStoreChange} />
              </div>
              <div className="pt-4">
                <Button type="submit" disabled={isSaving}>Save Configuration</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
