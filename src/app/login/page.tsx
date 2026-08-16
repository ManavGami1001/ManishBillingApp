"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Show a toast if they just verified their email
  React.useEffect(() => {
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.");
      // Remove query param to avoid re-triggering
      router.replace("/login");
    }
  }, [verified, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      if (result.error === "Email not verified") {
        toast.error("Please verify your email address before logging in.");
      } else {
        toast.error("Invalid username or password");
      }
      setLoading(false);
    } else {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration successful! Please check your email to verify your account.");
      setIsLogin(true); // Switch to login view
      // Clear password for security
      setPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Toaster position="top-center" />
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center pb-2">
            <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
              <Package className="h-6 w-6 text-slate-900 dark:text-slate-50" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isLogin ? "Welcome to Aavak.io" : "Create an Account"}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {isLogin
              ? "Enter your credentials to sign in."
              : "Sign up to start using Aavak.io."}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (isLogin ? "Signing in..." : "Signing up...")
                : (isLogin ? "Sign in" : "Sign up")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              disabled={loading}
              onClick={() => {
                setIsLogin(!isLogin);
                // Reset fields
                setUsername("");
                setPassword("");
                setEmail("");
              }}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
