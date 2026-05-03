"use client";

import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  PieChart as PieChartIcon, 
  Download,
  Building2,
  Car,
  FileText,
  Layout,
  Layers,
  ArrowUpRight,
  History,
  CheckCircle2,
  Clock,
  Filter,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";

export function ReportsClient({ proformas, carUnits, organization }: any) {
  const [journalFilter, setJournalFilter] = useState("all");
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Financial-Report-${new Date().toLocaleDateString()}`,
  });

  const exportToCSV = () => {
    const dataToExport = journalProformas;
    const headers = ["Date", "Customer", "Phone", "Car Model", "Chassis", "Payment Method", "Total Amount", "Advance Paid", "Credit Paid", "Institution", "Status"];
    const rows = dataToExport.map((p: any) => [
      new Date(p.createdAt).toLocaleDateString(),
      p.customer.name,
      p.customer.phone,
      p.carUnit.model.name,
      p.carUnit.chassisNumber,
      p.paymentMethod,
      p.amount,
      p.isAdvancePaid ? "YES" : "NO",
      p.isCreditPaid ? "YES" : "NO",
      p.bank?.name || "N/A",
      p.status === "PAID" ? "FULLY PAID" : "PARTIAL PAID"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales-Journal-${journalFilter}-${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getJournalStatus = (p: any) => {
    if (p.status === "PAID") return { label: "FULLY PAID", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 };
    if (p.paymentMethod === "CREDIT" && p.isAdvancePaid && !p.isCreditPaid) {
      return { label: "PARTIAL PAID", color: "text-blue-600 bg-blue-50", icon: Clock };
    }
    return { label: p.status, color: "text-slate-400 bg-slate-50", icon: History };
  };

  const journalProformas = proformas.filter((p: any) => {
    const isFullyPaid = p.status === "PAID";
    const isPartiallyPaid = p.paymentMethod === "CREDIT" && p.isAdvancePaid && !p.isCreditPaid;
    
    if (journalFilter === "paid") return isFullyPaid;
    if (journalFilter === "partial") return isPartiallyPaid;
    return isFullyPaid || isPartiallyPaid;
  });

  // 1. Financial Totals (Only based on PAID proformas)
  const paidProformas = proformas.filter((p: any) => p.status === "PAID");
  const totalRevenue = paidProformas.reduce((acc: number, p: any) => acc + p.amount, 0);
  const totalCredit = paidProformas.reduce((acc: number, p: any) => acc + p.creditAmount, 0);
  
  const vatRate = organization.isVatEnabled ? organization.vatRate / 100 : 0;
  const totalVat = paidProformas.reduce((acc: number, p: any) => {
    const vat = organization.isVatEnabled ? p.amount - (p.amount / (1 + vatRate)) : 0;
    return acc + vat;
  }, 0);

  // 2. Inventory Valuation
  const totalInventoryValue = carUnits.reduce((acc: number, c: any) => acc + c.unitPrice, 0);
  const soldValue = carUnits.filter((c: any) => c.status === "SOLD").reduce((acc: number, c: any) => acc + c.unitPrice, 0);
  const reservedValue = carUnits.filter((c: any) => c.status === "RESERVED").reduce((acc: number, c: any) => acc + c.unitPrice, 0);
  const availableValue = carUnits.filter((c: any) => c.status === "AVAILABLE").reduce((acc: number, c: any) => acc + c.unitPrice, 0);

  // 3. Bank Distribution (Based on Paid)
  const bankDataMap = paidProformas.reduce((acc: any, p: any) => {
    if (p.paymentMethod === "CREDIT" && p.bank) {
      acc[p.bank.name] = (acc[p.bank.name] || 0) + p.creditAmount;
    }
    return acc;
  }, {});

  const bankChartData = Object.keys(bankDataMap).map(name => ({
    name,
    value: bankDataMap[name]
  }));

  // 4. Sales by Model (Based on Paid)
  const modelSalesMap = paidProformas.reduce((acc: any, p: any) => {
    const name = p.carUnit.model.name;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const modelSalesData = Object.keys(modelSalesMap).map(name => ({
    name,
    sales: modelSalesMap[name]
  })).sort((a, b) => b.sales - a.sales);

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Compact Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Intelligence</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Financial & Inventory Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePrint()} className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider border-slate-200">
            <Download className="mr-2 h-3 w-3" /> Export PDF
          </Button>
          <Button size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900">
            Real-time Data
          </Button>
        </div>
      </div>

      <div ref={componentRef} className="space-y-4 print:p-8">
        {/* Print Only Header */}
        <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">{organization.name}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Performance Report</p>
          </div>
          <p className="text-[10px] font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
        </div>

        {/* High Density KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", value: totalRevenue, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50/50" },
            { label: "VAT", value: totalVat, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50/50" },
            { label: "Assets", value: totalInventoryValue, icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50/50" },
            { label: "Receivables", value: totalCredit, icon: Building2, color: "text-amber-600", bg: "bg-amber-50/50" },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className="text-lg font-black text-slate-900 tracking-tight">ETB {kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Compact Sales Model Chart */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                <Car className="h-3.5 w-3.5 text-blue-500" /> Model Performance
              </h3>
              <div className="px-2 py-1 bg-slate-50 rounded text-[8px] font-bold text-slate-400 uppercase">Units Sold</div>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelSalesData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compact Bank Distribution */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Bank Exposure
            </h3>
            <div className="h-44 w-full relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bankChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                    {bankChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-900">{(totalCredit/1000000).toFixed(1)}M</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {bankChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-400 truncate max-w-[80px]">{item.name}</span>
                  </div>
                  <span className="text-slate-900">ETB {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Distribution Table (Compact) */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-500" /> Inventory Valuation
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Grand Total: ETB {totalInventoryValue.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
            {[
              { label: "Available Stock", value: availableValue, sub: "Capital on floor", color: "bg-blue-500" },
              { label: "Reserved Units", value: reservedValue, sub: "Potential revenue", color: "bg-indigo-500" },
              { label: "Realized Sales", value: soldValue, sub: "Gross asset liquidation", color: "bg-emerald-500" },
            ].map((asset, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full", asset.color)} />
                    <span className="text-[10px] font-black uppercase text-slate-900">{asset.label}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400">{asset.sub}</p>
                </div>
                <p className="text-sm font-black text-slate-900">ETB {asset.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Transaction Ledger */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-white border rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Sales Journal</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Transaction Lifecycle tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-2 no-print">
              <div className="flex items-center gap-1 bg-white border p-1 rounded-lg shadow-sm mr-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Full Paid", value: "paid" },
                  { label: "Partial", value: "partial" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setJournalFilter(tab.value)}
                    className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all",
                      journalFilter === tab.value
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-wider border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              >
                <Download className="mr-2 h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b">
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pay Type</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Funding</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {journalProformas.map((p: any) => {
                  const status = getJournalStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-900">{p.customer.name.split(" - ")[0]}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{p.customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700">{p.carUnit.model.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">{p.carUnit.chassisNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                          p.paymentMethod === "CASH" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-600">
                          {p.paymentMethod === "CREDIT" ? (p.bank?.name || "Pending") : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                            <span>ETB {p.amount.toLocaleString()}</span>
                          </div>
                          <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all", p.status === "PAID" ? "bg-emerald-500 w-full" : "bg-blue-500 w-1/2")} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border", status.color, "border-current/10")}>
                          <status.icon className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-black uppercase">{status.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {journalProformas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching transactions</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending / Under Review Section */}
        {proformas.some((p: any) => p.status !== "PAID") && (
          <div className="bg-slate-50 border border-dashed rounded-2xl p-6 no-print">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-4 w-4 text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pipeline (Pending Accountant Approval)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {proformas.filter((p: any) => p.status !== "PAID").map((p: any) => (
                <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-900">{p.customer.name.split(" - ")[0]}</span>
                    <span className="text-[9px] text-slate-400">{p.carUnit.model.name}</span>
                  </div>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded uppercase">Under Review</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 10mm; size: auto; }
          .no-print { display: none !important; }
          .recharts-responsive-container {
            width: 100% !important;
            height: 250px !important;
          }
        }
      ` }} />
    </div>
  );
}
