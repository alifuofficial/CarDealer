"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { 
  Printer, 
  Download, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building2, 
  User, 
  CreditCard, 
  ShieldCheck,
  CheckCircle2,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { formatByPreference } from "@/lib/ethiopian-calendar";

interface ProformaViewProps {
  proforma: any;
  organization: any;
  companyAccounts: any[];
}

export function ProformaView({ proforma, organization, companyAccounts }: ProformaViewProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Proforma-${proforma.number}`,
  });

  const isVatEnabled = organization.isVatEnabled;
  const subtotal = isVatEnabled ? (proforma.amount / (1 + organization.vatRate / 100)) : proforma.amount;
  const vatAmount = isVatEnabled ? (proforma.amount - subtotal) : 0;
  
  const qrUrl = `${window.location.origin}/proformas/verify/${proforma.id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-3 no-print">
        <Button variant="outline" size="sm" onClick={() => handlePrint()} className="h-9 text-xs font-bold px-4 border-slate-200">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button size="sm" onClick={() => handlePrint()} className="h-9 text-xs font-bold px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div 
        ref={componentRef} 
        id="proforma-print-area"
        className="bg-white p-10 shadow-sm border border-slate-100 max-w-4xl mx-auto w-full text-slate-800 print:shadow-none print:p-0 print:border-none relative overflow-hidden"
        style={{ minHeight: "280mm" }}
      >
        {/* Status Watermark */}
        {proforma.status === "PAID" ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -rotate-[35deg] opacity-[0.07] select-none z-0">
            <h1 className="text-[280px] font-black text-emerald-600 tracking-[0.1em] leading-none">PAID</h1>
          </div>
        ) : proforma.status !== "CANCELLED" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -rotate-[35deg] opacity-[0.05] select-none z-0">
            <h1 className="text-[240px] font-black text-red-600 tracking-[0.05em] leading-none">UNPAID</h1>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {organization.name.substring(0, 1)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{organization.name}</h1>
                {proforma.status === "PAID" ? (
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Verified Paid</span>
                  </div>
                ) : proforma.status !== "CANCELLED" && (
                  <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shadow-sm">
                    <ShieldCheck className="h-3 w-3 text-red-600" />
                    <span className="text-[8px] font-black text-red-700 uppercase tracking-widest">Unpaid</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Car Dealership</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase">PROFORMA</h2>
            <p className="text-slate-400 font-mono font-bold text-xs">NO. {proforma.number}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8 text-[11px]">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Company Information</h4>
            <p className="text-slate-600 flex items-center gap-2"><MapPin className="h-3 w-3" /> {organization.address || "Addis Ababa, Ethiopia"}</p>
            <p className="text-slate-600 flex items-center gap-2"><Phone className="h-3 w-3" /> {organization.phone || "+251 900 000 000"}</p>
            {organization.email && <p className="text-slate-600 flex items-center gap-2"><Mail className="h-3 w-3" /> {organization.email}</p>}
            {organization.website && <p className="text-slate-600 flex items-center gap-2"><Globe className="h-3 w-3" /> {organization.website}</p>}
            {organization.tin && <p className="text-slate-600 flex items-center gap-2"><Building2 className="h-3 w-3" /> TIN: {organization.tin}</p>}
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Information</h4>
            <p className="text-slate-900 font-bold">{proforma.customer.name.split(" - ")[0]}</p>
            <p className="text-slate-600">{proforma.customer.phone}</p>
            <p className="text-slate-400 uppercase font-bold text-[9px]">{proforma.customer.type}</p>
          </div>
          <div className="space-y-1 text-right">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Details</h4>
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400">Date:</span> 
              <div className="flex flex-col items-end">
                <span className="font-bold">{format(new Date(proforma.createdAt), "MMM dd, yyyy")}</span>
                <span className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">
                  {formatByPreference(new Date(proforma.createdAt), "ETHIOPIAN")}
                </span>
              </div>
            </div>
            {proforma.expiryDate && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400">Expiry:</span> 
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${new Date() > new Date(proforma.expiryDate) ? "text-red-600" : "text-slate-900"}`}>
                    {format(new Date(proforma.expiryDate), "MMM dd, yyyy")}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    {formatByPreference(new Date(proforma.expiryDate), "ETHIOPIAN")}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between"><span className="text-slate-400">Method:</span> <span className="font-bold">{proforma.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Currency:</span> <span className="font-bold">ETB</span></div>
          </div>
        </div>

        {new Date() > new Date(proforma.expiryDate) && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center no-print">
            <p className="text-xs font-bold text-red-600 uppercase flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> This proforma has expired. The chassis reservation may no longer be valid.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-[10px] font-bold uppercase text-slate-400">Description</th>
                <th className="text-center py-3 text-[10px] font-bold uppercase text-slate-400">Qty</th>
                <th className="text-right py-3 text-[10px] font-bold uppercase text-slate-400">Unit Price</th>
                <th className="text-right py-3 text-[10px] font-bold uppercase text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4">
                  <p className="text-sm font-bold text-slate-900">{proforma.carUnit.model.name}</p>
                  <p className="text-[10px] text-slate-400">CHASSIS: <span className="font-mono">{proforma.carUnit.chassisNumber}</span></p>
                </td>
                <td className="py-4 text-center text-sm">1</td>
                <td className="py-4 text-right text-sm">{subtotal.toLocaleString()}</td>
                <td className="py-4 text-right text-sm font-bold">{subtotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financials & QR */}
        <div className="grid grid-cols-2 gap-12 border-t pt-8">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-3">Payment Accounts</h3>
              <div className="space-y-3">
                {companyAccounts?.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Please contact us for bank details.</p>
                ) : (
                  companyAccounts.map((acc: any) => (
                    <div key={acc.id} className="pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                      <p className="text-[10px] font-bold text-slate-900">{acc.bankName}</p>
                      <div className="flex justify-between text-[9px] mt-0.5">
                        <span className="text-slate-500">{acc.accountName}</span>
                        <span className="font-mono font-bold text-blue-600">{acc.accountNumber}</span>
                      </div>
                    </div>
                  ))
                )}
                
                {proforma.paymentMethod === "CREDIT" && proforma.bank && (
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Financing Institution</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase mt-1">{proforma.bank.name}</p>
                    <div className="flex justify-between text-[10px] mt-1">
                      <span className="text-slate-500">Financed Amount:</span>
                      <span className="font-bold text-slate-900">ETB {proforma.creditAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] text-slate-400 italic">
              * Please include reference #{proforma.number} in your transfer. Valid for {organization.defaultExpiryDays || 15} days.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Vehicle Price</span>
              <span className="font-bold">ETB {subtotal.toLocaleString()}</span>
            </div>
            {isVatEnabled && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">VAT ({organization.vatRate}%)</span>
                <span className="font-bold">+ ETB {vatAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-slate-900 text-lg font-black">
              <span className="text-[10px] self-center">GRAND TOTAL</span>
              <span className="text-slate-900">ETB {proforma.amount.toLocaleString()}</span>
            </div>

            {proforma.paymentMethod === "CREDIT" ? (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>Bank financing</span>
                  <span className="text-slate-500 font-black">ETB {proforma.creditAmount.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl flex justify-between items-center shadow-lg shadow-slate-200 ring-1 ring-white/10">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Payable Now</span>
                    </div>
                    <span className="text-sm font-black text-white uppercase leading-none">Advance Payment</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                      {isVatEnabled ? "Includes 100% of VAT" : "All payment is VAT inclusive"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white tracking-tighter block leading-none">ETB {proforma.advancePayment.toLocaleString()}</span>
                    {isVatEnabled && (
                      <div className="flex gap-2 text-[7px] font-bold text-slate-500 uppercase justify-end mt-1.5 border-t border-white/5 pt-1">
                        <span>Price: {(proforma.advancePayment - vatAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span className="text-blue-400">VAT: {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 rounded-xl flex justify-between items-center shadow-lg shadow-slate-200 ring-1 ring-white/10">
                <div className="flex flex-col text-white">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Total Settlement</span>
                  <span className="text-sm font-black uppercase leading-none">Full Cash Payment</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Includes {organization.vatRate}% VAT</span>
                </div>
                <div className="text-right text-white">
                  <span className="text-xl font-black tracking-tighter leading-none">ETB {proforma.amount.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
              <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <QRCodeSVG value={qrUrl} size={64} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Document Integrity</p>
                <p className="text-[8px] text-slate-400 leading-normal font-medium mt-0.5">This proforma is digitally signed. Scan to verify its status and original details on the car dealership portal.</p>
                <div className="flex flex-col gap-1 mt-2">
                  {!isVatEnabled && (
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-tight flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      All Selling price is including VAT
                    </p>
                  )}
                  {proforma.expiryDate && (
                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">
                      Validity date of this proforma: {formatByPreference(new Date(proforma.expiryDate), (organization.calendarType as any) || "GREGORIAN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center border-t border-slate-50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Thank you for choosing {organization.name}</p>
          <p className="text-[8px] text-slate-300 font-medium italic">Standard Terms: {organization.vatRate}% VAT applicable on all transactions. Bank processing fees not included.</p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 10mm; }
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #proforma-print-area, #proforma-print-area * { visibility: visible; }
          #proforma-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      ` }} />
    </div>
  );
}
