"use client";

import type React from "react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ILoingDetail } from "@/types/auth.type";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Login() {
  const [formData, setFormData] = useState<ILoingDetail>({
    email: "test@gmail.com",
    password: "1234",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let res;
    setLoading(true);
    try {
      res = await axios.post("/api/auth/login", formData);
      if (res.status === 200) {
        toast.success(res.data.message);
        router.push("/chat");
      }
    } catch (error) {
      toast.error("error while login");
      console.log(`error from login api from in app/login`, error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
      setFormData((prev) => ({
        ...prev,
        email: "",
        password: "",
      }));
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <main className="mx-auto h-screen max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Log in</CardTitle>
            <CardDescription>
              Welcome back. Enter your email and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-foreground/70">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
