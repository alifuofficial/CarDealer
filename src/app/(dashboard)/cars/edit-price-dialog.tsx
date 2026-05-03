"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2, Check } from "lucide-react";
import { updateCarPrices } from "@/lib/actions/cars";
import { useRouter } from "next/navigation";

interface EditPriceDialogProps {
  carId: string;
  currentCashPrice: number;
  currentCreditPrice: number;
  chassisNumber: string;
}

export function EditPriceDialog({ carId, currentCashPrice, currentCreditPrice, chassisNumber }: EditPriceDialogProps) {
  const [cashPrice, setCashPrice] = useState<string>(currentCashPrice.toString());
  const [creditPrice, setCreditPrice] = useState<string>(currentCreditPrice.toString());
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      await updateCarPrices(carId, parseFloat(cashPrice), parseFloat(creditPrice));
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Edit Unit Prices</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Update the selling prices for chassis <span className="font-mono text-slate-900 font-bold">{chassisNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cashPrice" className="text-xs font-bold uppercase tracking-wider text-slate-500">Cash Price (ETB)</Label>
            <div className="relative">
              <Input
                id="cashPrice"
                type="number"
                value={cashPrice}
                onChange={(e) => setCashPrice(e.target.value)}
                className="h-11 font-bold pl-12 text-lg"
              />
              <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">ETB</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditPrice" className="text-xs font-bold uppercase tracking-wider text-slate-500">Credit Price (ETB)</Label>
            <div className="relative">
              <Input
                id="creditPrice"
                type="number"
                value={creditPrice}
                onChange={(e) => setCreditPrice(e.target.value)}
                className="h-11 font-bold pl-12 text-lg"
              />
              <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">ETB</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending} className="font-bold text-xs">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 h-10 shadow-lg shadow-blue-100"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Prices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
