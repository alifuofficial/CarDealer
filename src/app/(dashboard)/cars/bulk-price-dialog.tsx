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
import { Layers, Loader2, Check } from "lucide-react";
import { updateModelPrices } from "@/lib/actions/cars";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkPriceDialogProps {
  models: any[];
}

export function BulkPriceDialog({ models }: BulkPriceDialogProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleSave = () => {
    if (!selectedModelId || !price || parseFloat(price) <= 0) return;
    
    startTransition(async () => {
      await updateModelPrices(selectedModelId, parseFloat(price));
      setOpen(false);
      setPrice("");
      setSelectedModelId("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 font-bold">
            <Layers className="mr-2 h-4 w-4" />
            Bulk Update Prices
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Bulk Price Update</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Set a unified price for all individual units of a specific car model.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Car Model</Label>
            <Select onValueChange={(val) => setSelectedModelId(val || "")} value={selectedModelId}>
              <SelectTrigger className="h-11 font-bold border-slate-200">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} label={model.name}>
                    <div className="flex justify-between w-full gap-4">
                      <span>{model.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">({model.units.length} units)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-price" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Set New Unit Price (ETB)</Label>
            <div className="relative">
              <Input
                id="bulk-price"
                type="number"
                placeholder="e.g. 2500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 font-bold pl-12 text-lg border-slate-200"
              />
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">ETB</span>
            </div>
            {selectedModel && (
              <p className="text-[10px] text-blue-600 font-bold uppercase mt-2">
                * You are updating {selectedModel.units.length} units of {selectedModel.name}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl border-t">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending} className="font-bold text-xs">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || !price || !selectedModelId} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 h-10 shadow-lg shadow-blue-100"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Update All Units
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
