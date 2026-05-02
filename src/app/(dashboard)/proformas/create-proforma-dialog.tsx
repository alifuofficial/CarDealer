"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, FileText, Calculator, Search } from "lucide-react";
import { createProforma } from "@/lib/actions/proformas";
import { cn } from "@/lib/utils";

type CreateProformaDialogProps = {
  customers: any[];
  availableCars: any[];
  banks: any[];
  vatSettings: {
    enabled: boolean;
    rate: number;
  };
};

export function CreateProformaDialog({ customers, availableCars, banks, vatSettings }: CreateProformaDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [advancePercentage, setAdvancePercentage] = useState<number>(50);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredCars = availableCars.filter(unit => 
    unit.model.name.toLowerCase().includes(carSearch.toLowerCase()) ||
    unit.chassisNumber.toLowerCase().includes(carSearch.toLowerCase())
  );

  const selectedCar = availableCars.find(c => c.id === selectedCarId);
  const netPrice = parseFloat(amount || "0");
  const totalVat = vatSettings.enabled ? (netPrice * vatSettings.rate) / 100 : 0;
  const grandTotal = netPrice + totalVat;

  // Flexible Credit calculation
  // Standard Rule: Advance Payment = (Percentage of Net Price) + FULL VAT
  const percentage = paymentMethod === "CREDIT" ? Math.max(50, advancePercentage) : 100;
  const advancePayment = (netPrice * (percentage / 100)) + totalVat;
  const creditAmount = paymentMethod === "CREDIT" ? netPrice - (netPrice * (percentage / 100)) : 0;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="h-9 bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Create Proforma
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Create Proforma</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Generate a new proforma invoice for a customer.
          </DialogDescription>
        </DialogHeader>
        <form action={createProforma} className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer</Label>
                <Select name="customerId" required>
                  <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                    <SelectValue placeholder="Choose customer" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px]">
                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                        <input 
                          placeholder="Search name..." 
                          className="h-8 w-full rounded bg-slate-50 pl-7 pr-2 text-[11px] font-medium outline-none border focus:ring-1 focus:ring-slate-200"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase">No customers found</div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id} label={c.name} className="font-medium py-2">
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Car Unit</Label>
                <Select 
                  name="carUnitId" 
                  onValueChange={(val: string) => {
                    setSelectedCarId(val);
                    const car = availableCars.find(c => c.id === val);
                    if (car) setAmount(car.unitPrice.toString());
                  }}
                  required
                >
                  <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                    <SelectValue placeholder="Choose vehicle" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[240px]">
                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                        <input 
                          placeholder="Search model or chassis..." 
                          className="h-8 w-full rounded bg-slate-50 pl-7 pr-2 text-[11px] font-medium outline-none border focus:ring-1 focus:ring-slate-200"
                          value={carSearch}
                          onChange={(e) => setCarSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {filteredCars.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase">No vehicles found</div>
                    ) : (
                      filteredCars.map((unit) => (
                        <SelectItem 
                          key={unit.id} 
                          value={unit.id} 
                          label={`${unit.model.name} (${unit.chassisNumber})`} 
                          className="font-medium py-2.5"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-900">{unit.model.name}</span>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                              {unit.chassisNumber}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Option</Label>
                <Select name="paymentMethod" defaultValue="CASH" onValueChange={(val: string) => setPaymentMethod(val)}>
                  <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH" label="Full Cash">Full Cash</SelectItem>
                    <SelectItem value="CREDIT" label="Credit (Bank/MFI)">Credit (Bank/MFI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "CREDIT" ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Advance Payment (%)</Label>
                    {advancePercentage < 50 && (
                      <span className="text-[10px] font-black text-red-500 uppercase animate-pulse">Min 50% Required</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min="50" 
                      max="100" 
                      value={advancePercentage}
                      onChange={(e) => setAdvancePercentage(parseInt(e.target.value) || 0)}
                      onBlur={() => {
                        if (advancePercentage < 50) setAdvancePercentage(50);
                      }}
                      className={cn(
                        "h-10 font-bold pr-10",
                        advancePercentage < 50 && "border-red-500 focus-visible:ring-red-500"
                      )} 
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price (ETB)</Label>
                  <div className="relative">
                    <Input 
                      name="amount" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-10 font-bold pl-12" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required 
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-[10px] font-bold">ETB</span>
                  </div>
                </div>
              )}
            </div>

            {paymentMethod === "CREDIT" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price (ETB)</Label>
                  <div className="relative">
                    <Input 
                      name="amount" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-10 font-bold pl-12" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required 
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-[10px] font-bold">ETB</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Bank/MFI</Label>
                  <Select name="bankId" required={paymentMethod === "CREDIT"}>
                    <SelectTrigger className="w-full h-10 font-medium text-slate-700">
                      <SelectValue placeholder="Choose institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.id} label={b.name} className="font-medium">
                          {b.name} ({b.type === "BANK" ? "Bank" : "MFI"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Financial Preview */}
            <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Net Price</span>
                  <span>ETB {netPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-blue-600">
                  <span>VAT ({vatSettings.enabled ? `${vatSettings.rate}%` : "Disabled"})</span>
                  <span>+ ETB {totalVat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span>ETB {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {paymentMethod === "CREDIT" && (
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Advance ({percentage}%)</span>
                    <span className="text-xs font-bold text-slate-900">ETB {advancePayment.toLocaleString()}</span>
                    <input type="hidden" name="advancePayment" value={advancePayment} />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Bank Credit ({100 - percentage}%)</span>
                    <span className="text-xs font-bold text-blue-600">ETB {creditAmount.toLocaleString()}</span>
                    <input type="hidden" name="creditAmount" value={creditAmount} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              disabled={paymentMethod === "CREDIT" && advancePercentage < 50}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Proforma
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
