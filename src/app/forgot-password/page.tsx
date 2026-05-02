"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Mail, Phone, Lock, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { requestOtp, verifyOtpAndResetPassword } from "@/lib/actions/auth";
import { useOrganization } from "@/components/organization-provider";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const { organization } = useOrganization();
  const router = useRouter();

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier) return toast.error("Please enter your email or phone");

    setIsLoading(true);
    try {
      const res = await requestOtp(identifier);
      if (res.success) {
        if (res.userId) setUserId(res.userId);
        setStep(2);
        toast.success("OTP sent successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to request OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setIsLoading(true);
    try {
      const res = await verifyOtpAndResetPassword(userId, otp, newPassword);
      if (res.success) {
        setStep(3);
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
        <CardContent className="p-8 lg:p-12">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg overflow-hidden p-1.5 shrink-0">
              {organization?.logoUrl ? (
                <img src={organization.logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Car className="h-6 w-6" />
              )}
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase shrink-0">
              {organization?.siteTitle || "CarDealer"}
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Enter your registered email or phone number and we'll send you an OTP to reset your password.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email or Phone</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@cardealer.local"
                      className="h-12 bg-slate-50 border-slate-200 pl-10 rounded-xl focus:ring-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <Button 
                  disabled={isLoading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Reset OTP"}
                </Button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verify Identity</h1>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  We've sent a 6-digit code to <span className="text-slate-900 font-bold">{identifier}</span>.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">6-Digit OTP</label>
                  <Input 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="h-14 bg-slate-50 border-slate-200 text-center text-2xl font-black tracking-[0.5em] rounded-xl focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 bg-slate-50 border-slate-200 pl-10 rounded-xl focus:ring-blue-600 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 bg-slate-50 border-slate-200 pl-10 rounded-xl focus:ring-blue-600 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                </Button>
                
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest"
                >
                  Back to Identifier
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 py-4 text-center animate-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h1>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                  Your password has been updated. You can now use your new credentials to login.
                </p>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em]">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Footer */}
          {step !== 3 && (
            <div className="mt-12 pt-8 border-t flex items-center justify-center">
              <Link href="/login" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-[500px] w-[500px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
