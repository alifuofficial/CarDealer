"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Lock,
  ChevronRight,
  Layout,
  Loader2,
  Check,
  Calculator,
  Trash2,
  Plus,
  CreditCard,
  Clock,
  MessageSquare,
  ShieldCheck,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateOrganization } from "@/lib/actions/organization";
import { updateProfile, updatePassword } from "@/lib/actions/user";
import { createBank, deleteBank } from "@/lib/actions/banks";
import { createCompanyAccount, deleteCompanyAccount } from "@/lib/actions/accounts";
import { formatByPreference } from "@/lib/ethiopian-calendar";
import { updateSmsTemplate } from "@/lib/actions/marketing";
import { testSmtpConnection } from "@/lib/actions/email";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type SettingsClientProps = {
  organization: any;
  banks: any[];
  companyAccounts: any[];
  smsTemplates: any[];
};

export function SettingsClient({ organization, banks, companyAccounts, smsTemplates: initialTemplates }: SettingsClientProps) {
  const { data: session, update: updateSession } = useSession();
  const [activeCategory, setActiveCategory] = useState("Organization");

  React.useEffect(() => {
    const role = (session?.user as any)?.role;
    if ((role === "ACCOUNTANT" || role === "SELLER") && activeCategory === "Organization") {
      setActiveCategory("Account");
    }
  }, [session, activeCategory]);
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState(organization?.logoUrl || "");
  const [saved, setSaved] = useState(false);
  const [smsTemplates, setSmsTemplates] = useState(initialTemplates);

  const role = (session?.user as any)?.role;
  const isRestrictedRole = role === "ACCOUNTANT" || role === "SELLER";

  const allCategories = [
    { id: "Organization", icon: Shield, label: "Organization Info", adminOnly: true },
    { id: "Account", icon: User, label: "Account Profile", adminOnly: false },
    { id: "Financial", icon: Globe, label: "Financial Institutions", adminOnly: true },
    { id: "Payments", icon: CreditCard, label: "Payment Methods", adminOnly: true },
    { id: "Email", icon: Mail, label: "Email & SMTP", adminOnly: true },
    { id: "Security", icon: Lock, label: "Security & Login", adminOnly: false },
    { id: "System", icon: Database, label: "System Config", adminOnly: true },
    { id: "Notifications", icon: Bell, label: "Notifications", adminOnly: true },
  ];

  const categories = isRestrictedRole
    ? allCategories.filter((c) => !c.adminOnly)
    : allCategories;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setSaved(false);
    startTransition(async () => {
      if (activeCategory === "Account") {
        await updateProfile(formData);
        await updateSession({
          name: formData.get("name"),
          email: formData.get("email"),
        });
      } else if (activeCategory === "Security") {
        try {
          await updatePassword(formData);
          toast.success("Password updated successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to update password");
          return;
        }
      } else {
        await updateOrganization(formData);
      }
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "Organization":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Organization Profile</h3>
              <p className="text-sm text-slate-500">Update your company details and legal information.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-40 flex flex-col items-center gap-4">
                <div className="h-40 w-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center relative group overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <Layout className="h-8 w-8" />
                      <span className="text-[10px] font-bold uppercase">Upload Logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                  Min 512x512px<br />SVG, PNG or JPG
                </p>
              </div>

              <div className="flex-1 grid gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</label>
                    <input
                      name="name"
                      defaultValue={organization?.name || ""}
                      className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="Alif Soreti Car Dealer"
                      required
                    />
                  </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Office Address</label>
                  <textarea
                    name="address"
                    defaultValue={organization?.address || ""}
                    className="w-full h-24 rounded-lg border bg-slate-50 p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none"
                    placeholder="Addis Ababa, Bole Road, Building 4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Business Phone</label>
                    <input
                      name="phone"
                      defaultValue={organization?.phone || ""}
                      className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="251 900 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Email</label>
                    <input
                      name="email"
                      defaultValue={organization?.email || ""}
                      className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="hello@alifsoreti.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Website</label>
                    <input
                      name="website"
                      defaultValue={organization?.website || ""}
                      className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="https://alifsoreti.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">TIN Number</label>
                    <input
                      name="tin"
                      defaultValue={organization?.tin || ""}
                      className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                      placeholder="0012345678"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">System Branding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">System Title</label>
                      <input
                        name="siteTitle"
                        defaultValue={organization?.siteTitle || ""}
                        className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                        placeholder="Soreti Car Dealer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Favicon (.ico, .png)</label>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden">
                          {organization?.faviconUrl ? (
                            <img src={organization.faviconUrl} className="h-6 w-6 object-contain" alt="favicon" />
                          ) : (
                            <Globe className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <input
                          type="file"
                          name="favicon"
                          accept=".ico,.png"
                          className="flex-1 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Account":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Account Profile</h3>
              <p className="text-sm text-slate-500">Manage your public information and identity.</p>
            </div>
            <div className="grid gap-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input 
                  name="name"
                  defaultValue={session?.user?.name || ""}
                  className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <input 
                  name="email"
                  defaultValue={session?.user?.email || ""}
                  className="w-full h-10 rounded-lg border bg-slate-50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>
          </div>
        );
      case "Security":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security & Login</h3>
              <p className="text-sm text-slate-500">Update your account password and security preferences.</p>
            </div>

            <div className="p-6 rounded-3xl border bg-slate-50/50 space-y-6 max-w-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Password</label>
                  <input 
                    name="currentPassword"
                    type="password"
                    className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                    <input 
                      name="newPassword"
                      type="password"
                      className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                    <input 
                      name="confirmPassword"
                      type="password"
                      className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  Strong passwords include a mix of uppercase letters, numbers, and symbols. We recommend at least 8 characters for maximum security.
                </p>
              </div>
            </div>
          </div>
        );
      case "Email":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Email & SMTP Configuration</h3>
                <p className="text-sm text-slate-500">Manage automated email notifications and server settings.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border rounded-xl">
                <p className="text-[10px] font-black uppercase text-slate-500">System Email Status</p>
                <div className="flex items-center gap-2 ml-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="hidden" name="__has_isEmailEnabled" value="1" />
                    <input
                      type="checkbox"
                      name="isEmailEnabled"
                      defaultChecked={organization?.isEmailEnabled}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-[10px] font-bold uppercase text-slate-900">
                    {organization?.isEmailEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 rounded-3xl border bg-slate-50/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    Server Settings
                  </h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Host</label>
                      <input 
                        name="smtpHost"
                        defaultValue={organization?.smtpHost || ""}
                        className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                        placeholder="smtp.gmail.com" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Port</label>
                        <input 
                          name="smtpPort"
                          type="number"
                          defaultValue={organization?.smtpPort || 587}
                          className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                          placeholder="587" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Encryption</label>
                        <select className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300">
                          <option>STARTTLS (Recommended)</option>
                          <option>SSL/TLS</option>
                          <option>None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border bg-slate-50/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Authentication
                  </h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Username</label>
                      <input 
                        name="smtpUser"
                        defaultValue={organization?.smtpUser || ""}
                        className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                        placeholder="user@example.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">SMTP Password</label>
                      <input 
                        name="smtpPassword"
                        type="password"
                        defaultValue={organization?.smtpPassword || ""}
                        className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl border bg-slate-50/50 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Sender Identity
                  </h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">From Email Address</label>
                      <input 
                        name="smtpFromEmail"
                        defaultValue={organization?.smtpFromEmail || ""}
                        className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                        placeholder="noreply@dealer.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sender Display Name</label>
                      <input 
                        name="smtpFromName"
                        defaultValue={organization?.smtpFromName || ""}
                        className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                        placeholder="Soreti Car Dealer" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-amber-100 bg-amber-50/30 space-y-4">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Connectivity Test
                  </h4>
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    Test your SMTP settings by sending a validation email to your identity address. Ensure all fields above are filled correctly before testing.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      id="test-recipient"
                      className="flex-1 h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-300" 
                      placeholder="test@example.com" 
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      className="h-10 border-amber-200 text-amber-700 font-black text-[10px] uppercase tracking-widest hover:bg-amber-100"
                      onClick={async () => {
                        const recipient = (document.getElementById("test-recipient") as HTMLInputElement).value;
                        if (!recipient) {
                          toast.error("Please enter a test recipient email");
                          return;
                        }
                        const fd = new FormData();
                        // Get current values from the form inputs
                        const inputs = document.querySelectorAll('input[name^="smtp"]');
                        inputs.forEach((input: any) => fd.append(input.name, input.value));
                        fd.append("testRecipient", recipient);
                        
                        toast.promise(testSmtpConnection(fd), {
                          loading: 'Testing SMTP connection...',
                          success: (data) => data.message,
                          error: (err) => err.message
                        });
                      }}
                    >
                      Run Test
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Financial":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Financial Institutions</h3>
                <p className="text-sm text-slate-500">Manage banks and microfinance partners for credit sales.</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Add New Institution</h4>
                <div className="flex gap-3">
                  <input 
                    id="new-bank-name"
                    className="flex-1 h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" 
                    placeholder="Bank Name (e.g. CBE, Awash)" 
                  />
                  <select 
                    id="new-bank-type"
                    className="w-40 h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300"
                  >
                    <option value="BANK">Bank</option>
                    <option value="MICROFINANCE">Microfinance</option>
                  </select>
                  <Button 
                    type="button"
                    onClick={async () => {
                      const nameInput = document.getElementById("new-bank-name") as HTMLInputElement;
                      const typeInput = document.getElementById("new-bank-type") as HTMLSelectElement;
                      if (nameInput.value) {
                        const fd = new FormData();
                        fd.append("name", nameInput.value);
                        fd.append("type", typeInput.value);
                        toast.promise(createBank(fd), {
                          loading: "Adding institution...",
                          success: () => {
                            nameInput.value = "";
                            router.refresh();
                            return "Institution added successfully";
                          },
                          error: (err) => err.message || "Failed to add institution"
                        });
                      }
                    }}
                    className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500 italic">No institutions added yet.</td>
                      </tr>
                    ) : (
                      banks?.map((bank) => (
                        <tr key={bank.id} className="border-b last:border-0 hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{bank.name}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase",
                              bank.type === "BANK" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                            )}>
                              {bank.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              type="button"
                              variant="ghost" 
                              onClick={async () => {
                                toast.promise(deleteBank(bank.id), {
                                  loading: "Removing...",
                                  success: () => {
                                    router.refresh();
                                    return "Institution removed";
                                  },
                                  error: (err) => err.message
                                });
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "Payments":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
              <p className="text-sm text-slate-500">Configure your company bank accounts to be displayed on proformas.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Add New Bank Account</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Name</label>
                    <input id="acc-bank-name" className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" placeholder="e.g. Bank of Abyssinia" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Name</label>
                    <input id="acc-name" className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" placeholder="e.g. Alif Soreti PLC" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number</label>
                    <input id="acc-number" className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" placeholder="e.g. 10002345678" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SWIFT Code (Optional)</label>
                    <input id="acc-swift" className="w-full h-10 rounded-lg border bg-white px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-300" placeholder="e.g. ABYS ET AA" />
                  </div>
                </div>
                <Button 
                  type="button"
                  onClick={async () => {
                    const bankName = document.getElementById("acc-bank-name") as HTMLInputElement;
                    const accName = document.getElementById("acc-name") as HTMLInputElement;
                    const accNum = document.getElementById("acc-number") as HTMLInputElement;
                    const swift = document.getElementById("acc-swift") as HTMLInputElement;
                    
                    if (bankName.value && accName.value && accNum.value) {
                      const fd = new FormData();
                      fd.append("bankName", bankName.value);
                      fd.append("accountName", accName.value);
                      fd.append("accountNumber", accNum.value);
                      fd.append("swiftCode", swift.value);
                      
                      toast.promise(createCompanyAccount(fd), {
                        loading: "Adding payment method...",
                        success: () => {
                          bankName.value = "";
                          accName.value = "";
                          accNum.value = "";
                          swift.value = "";
                          router.refresh();
                          return "Payment method added successfully";
                        },
                        error: (err) => err.message || "Failed to add payment method"
                      });
                    }
                  }}
                  className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bank / Account</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Number</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyAccounts?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500 italic">No accounts added yet.</td>
                      </tr>
                    ) : (
                      companyAccounts?.map((acc) => (
                        <tr key={acc.id} className="border-b last:border-0 hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{acc.bankName}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold">{acc.accountName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{acc.accountNumber}</code>
                            {acc.swiftCode && <p className="text-[9px] text-slate-400 mt-1 uppercase">SWIFT: {acc.swiftCode}</p>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              type="button"
                              variant="ghost" 
                              onClick={async () => {
                                toast.promise(deleteCompanyAccount(acc.id), {
                                  loading: "Removing...",
                                  success: () => {
                                    router.refresh();
                                    return "Account removed";
                                  },
                                  error: (err) => err.message
                                });
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "Security":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security & Login</h3>
              <p className="text-sm text-slate-500">Secure your account with multi-factor authentication.</p>
            </div>
            <div className="grid gap-3 max-w-xl">
              {["Two-Factor Authentication", "Change Password", "Login History", "Authorized Devices"].map((item) => (
                <button key={item} type="button" className="flex items-center justify-between p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all text-sm font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-slate-400" />
                    {item}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        );
      case "System":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">System Configuration</h3>
              <p className="text-sm text-slate-500">Core engine and data management settings.</p>
            </div>
            <div className="grid gap-6 max-w-xl">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Tax Management (Ethiopia)
                </h4>
                <div className="p-4 rounded-xl border bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Enable VAT</p>
                      <p className="text-[10px] text-slate-500 font-medium">Apply VAT to all new proformas.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="hidden" name="__has_isVatEnabled" value="1" />
                      <input
                        type="checkbox"
                        name="isVatEnabled"
                        defaultChecked={organization?.isVatEnabled !== false}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Value Added Tax (VAT) Rate</p>
                      <p className="text-[10px] text-slate-500 font-medium">Standard rate for business transactions in Ethiopia.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1">
                      <input
                        name="vatRate"
                        type="number"
                        step="0.1"
                        defaultValue={organization?.vatRate || 15.0}
                        className="w-12 text-right text-sm font-bold bg-transparent outline-none"
                      />
                      <span className="text-sm font-bold text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Regional & Calendar
                </h4>
                <div className="p-4 rounded-xl border bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Preferred Calendar</p>
                      <p className="text-[10px] text-slate-500 font-medium">Choose between Ethiopia or Gregorian calendar system.</p>
                    </div>
                    <div className="flex bg-white border rounded-lg p-1">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="calendarType"
                          value="GREGORIAN"
                          defaultChecked={organization?.calendarType !== "ETHIOPIAN"}
                          className="sr-only peer"
                        />
                        <div className="px-3 py-1 text-[10px] font-bold uppercase rounded-md peer-checked:bg-slate-900 peer-checked:text-white transition-all">Gregorian</div>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="calendarType"
                          value="ETHIOPIAN"
                          defaultChecked={organization?.calendarType === "ETHIOPIAN"}
                          className="sr-only peer"
                        />
                        <div className="px-3 py-1 text-[10px] font-bold uppercase rounded-md peer-checked:bg-slate-900 peer-checked:text-white transition-all">Ethiopia</div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Document Lifecycle
                </h4>
                <div className="p-4 rounded-xl border bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Default Proforma Validity</p>
                      <p className="text-[10px] text-slate-500 font-medium">How many days a proforma remains valid after creation.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1">
                      <input
                        name="defaultExpiryDays"
                        type="number"
                        min="1"
                        max="365"
                        defaultValue={organization?.defaultExpiryDays || 15}
                        className="w-12 text-right text-sm font-bold bg-transparent outline-none"
                      />
                      <span className="text-sm font-bold text-slate-400">DAYS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  Date Preview
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-white space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gregorian</p>
                    <p className="text-sm font-bold text-slate-700">{formatByPreference(new Date(), "GREGORIAN")}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-blue-50/50 border-blue-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Ethiopia</p>
                    <p className="text-sm font-bold text-blue-900">{formatByPreference(new Date(), "ETHIOPIAN")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Notifications":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Notification Settings</h3>
              <p className="text-sm text-slate-500">Configure how you and your customers receive updates.</p>
            </div>

            <div className="grid gap-6 max-w-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border">
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">SMS Ethiopia Integration</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Connect to smsethiopia.et for sub-second SMS delivery.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border bg-white space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">Enable SMS Notifications</p>
                      <p className="text-[10px] text-slate-500 font-medium italic">Sends automatic SMS to customers when proformas are created.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="hidden" name="__has_isSmsEnabled" value="1" />
                      <input
                        type="checkbox"
                        name="isSmsEnabled"
                        defaultChecked={organization?.isSmsEnabled}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2 border-t pt-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">API Key (KEY Header)</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="smsApiKey"
                        defaultValue={organization?.smsApiKey}
                        className="w-full h-11 rounded-xl border bg-white px-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                        placeholder="Enter your SMSEthiopia API Key"
                      />
                      <div className="absolute right-4 top-3.5">
                        <Lock className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-2">
                      <Shield className="h-3 w-3" />
                      Your key is encrypted and stored securely. Never share it.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-900 uppercase">Service Status</p>
                      <p className="text-[9px] text-green-600 font-bold uppercase flex items-center gap-1">
                        <Check className="h-2 w-2" />
                        API v3.0 Live
                      </p>
                    </div>
                    <a href="https://smsethiopia.et/console" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter">
                      Get Key from Console
                    </a>
                  </div>
                </div>

                {/* SMS Templates */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-900">SMS Templates</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Customize automated messages. Use variables like <span className="text-blue-600 font-bold">[CustomerName]</span>, <span className="text-blue-600 font-bold">[Amount]</span>, etc.</p>
                  
                  <div className="space-y-4">
                    {smsTemplates.map((template: any) => (
                      <div key={template.id} className="p-4 rounded-2xl border bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{template.name.replace('_', ' ')}</span>
                          <Badge variant="outline" className="text-[8px] font-bold">Variable Enabled</Badge>
                        </div>
                        <textarea
                          defaultValue={template.content}
                          onChange={(e) => {
                            const newTemplates = smsTemplates.map((t: any) => 
                              t.id === template.id ? { ...t, content: e.target.value } : t
                            );
                            setSmsTemplates(newTemplates);
                          }}
                          onBlur={async (e) => {
                            await updateSmsTemplate(template.id, e.target.value);
                          }}
                          className="w-full min-h-[80px] bg-slate-50 border-none rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed text-slate-400 font-bold uppercase tracking-widest text-xs">
            Module under development
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm font-medium text-slate-500">Configure your workspace and personal preferences.</p>
      </header>

      <form action={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                activeCategory === cat.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <cat.icon className={cn("h-4 w-4", activeCategory === cat.id ? "text-white" : "text-slate-400")} />
              {cat.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white rounded-3xl border p-8 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex-1">
            {renderContent()}
          </div>

          <div className="mt-12 pt-8 border-t flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" className="h-10 px-6 text-xs font-bold text-slate-500 hover:text-slate-900">Discard Changes</Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "h-10 px-8 text-xs font-bold text-white shadow-md transition-all min-w-[140px]",
                saved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                "Update Settings"
              )}
            </Button>
          </div>
        </main>
      </form>
    </div>
  );
}
