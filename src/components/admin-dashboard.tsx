"use client";

import React from "react";
import { InventoryChart, StatusDistributionChart } from "./dashboard-charts";
import Link from "next/link";
import { Package, CheckCircle, Users, User, Calendar, AlertCircle, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatByPreference } from "@/lib/ethiopian-calendar";
import { Badge } from "@/components/ui/badge";

type Vehicle = any;
type Customer = any;

type AdminDashboardProps = {
  stats: {
    totalCars: number;
    availableCars: number;
    totalCustomers: number;
    totalUsers: number;
    recentCars: Vehicle[];
    recentCustomers: Customer[];
    smsStats: {
      success: number;
      error: number;
    };
  };
};

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const { totalCars, availableCars, totalCustomers, totalUsers, recentCars, recentCustomers, smsStats } = stats;

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-8">
      {/* High Density Header */}
      <div className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Executive Overview</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">System Status: Nominal</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Ethiopia</span>
            <span className="text-xs font-bold text-slate-900">{formatByPreference(new Date(), "ETHIOPIAN")}</span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Gregorian</span>
            <span className="text-xs font-bold text-slate-900">{formatByPreference(new Date(), "GREGORIAN")}</span>
          </div>
        </div>
      </div>

      {/* High Density KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Inventory", value: totalCars, icon: Package, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "Available", value: availableCars, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/50" },
          { label: "Total Leads", value: totalCustomers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50/50" },
          { label: "Team Size", value: totalUsers, icon: User, color: "text-amber-600", bg: "bg-amber-50/50" },
        ].map((k, idx) => (
          <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", k.bg)}>
                <k.icon className={cn("h-3.5 w-3.5", k.color)} />
              </div>
              <ArrowUpRight className="h-3 w-3 text-slate-300" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{k.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Marketing Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SMS Deliveries</p>
              <p className="text-lg font-black text-slate-900 tracking-tight">{smsStats.success.toLocaleString()}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Active</span>
        </div>
        <div className="bg-white border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-rose-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-rose-100">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Failed Logs</p>
              <p className="text-lg font-black text-slate-900 tracking-tight">{smsStats.error.toLocaleString()}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[8px] font-black uppercase">Review</span>
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Inventory Growth</h3>
            <div className="flex gap-4 text-[9px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-blue-500" /> Units</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-indigo-500" /> Leads</span>
            </div>
          </div>
          <div className="h-60">
            <InventoryChart />
          </div>
        </div>

        <div className="bg-white border rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">Stock Status</h3>
          <div className="h-48">
            <StatusDistributionChart />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-50">
            {[
              { label: "Available", color: "bg-blue-500" },
              { label: "Reserved", color: "bg-indigo-500" },
              { label: "Sold", color: "bg-rose-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Recent Inventory</h4>
            <Link href="/cars" className="text-[9px] font-black text-blue-600 uppercase hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentCars.map((car) => (
              <div key={car.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">{car.model?.name ?? "Vehicle"}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">{car.chassisNumber}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter py-0">{car.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Active Leads</h4>
            <Link href="/customers" className="text-[9px] font-black text-blue-600 uppercase hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">{c.name.split(" - ")[0]}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">by {c.createdBy?.name}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-500">{c.type ?? "Lead"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
