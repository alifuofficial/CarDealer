"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Car, Lock, Mail, Loader2, ShieldCheck, Cloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

import { useOrganization } from "@/components/organization-provider";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { organization } = useOrganization();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Successfully logged in!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side: Content/Form */}
      <div className="flex w-full flex-col justify-center bg-white px-8 md:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg overflow-hidden p-1.5">
                {organization?.logoUrl ? (
                  <img src={organization.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Car className="h-6 w-6" />
                )}
              </div>
              <span className="modern-gradient-text text-xl font-bold tracking-tight uppercase">
                {organization?.siteTitle || "CarDealer"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              <Cloud className="h-3 w-3" />
              Cloud Platform
            </div>
          </div>

          <div className="mb-10 space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-medium">SSL Secure Connection</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your email below to login to your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="yourname@email.com"
                          className="h-11 border-slate-200 bg-slate-50 pl-10 focus-visible:ring-blue-600"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-11 border-slate-200 bg-slate-50 pl-10 focus-visible:ring-blue-600"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-11 w-full bg-blue-600 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {organization?.name || "CarDealer"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Decorative Image */}
      <div className="relative hidden w-1/2 md:block">
        <img
          src="/login_bg_luxury_cars_1777458072456.png"
          alt="Luxury Car Showroom"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" />
        <div className="absolute bottom-16 left-16 right-16 space-y-4 rounded-2xl bg-white/10 p-8 text-white backdrop-blur-xl ring-1 ring-white/20">
          <h2 className="text-2xl font-bold">Manage your fleet with ease</h2>
          <p className="text-blue-100">
            Access real-time analytics, inventory tracking, and customer management all in one secure platform.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-xl font-bold">100%</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-200">
                Secure
              </span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">24/7</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-200">
                Availability
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
