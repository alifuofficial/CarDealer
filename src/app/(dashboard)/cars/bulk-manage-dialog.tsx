"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Layers,
  ChevronRight
} from "lucide-react";
import { deleteAllCars, deleteCarsByModel } from "@/lib/actions/cars";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface BulkManageDialogProps {
  models: any[];
}

export function BulkManageDialog({ models }: BulkManageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const router = useRouter();

  async function handleBulkDelete() {
    if (!confirm("Are you ABSOLUTELY sure? This will delete EVERY car unit and EVERY model in the entire system. This action is IRREVERSIBLE.")) return;
    
    setIsLoading(true);
    try {
      await deleteAllCars();
      toast.success("System wiped: All cars and models deleted.");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to wipe data.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteByModel() {
    if (!selectedModelId) return;
    const model = models.find(m => m.id === selectedModelId);
    if (!confirm(`Delete all units and the model definition for "${model?.name}"?`)) return;

    setIsLoading(true);
    try {
      await deleteCarsByModel(selectedModelId);
      toast.success(`Deleted all units for ${model?.name}`);
      setSelectedModelId("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete by model.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" /> Bulk Manage
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Bulk Data Management</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Perform administrative cleanup operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Delete by Model */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Delete by Model</h4>
            </div>
            <div className="flex gap-2">
              <Select value={selectedModelId} onValueChange={(val: string) => setSelectedModelId(val)}>
                <SelectTrigger className="flex-1 h-10 font-medium">
                  <SelectValue placeholder="Select a car model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id} label={m.name}>
                      {m.name} ({m.units.length} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="destructive" 
                onClick={handleDeleteByModel}
                disabled={!selectedModelId || isLoading}
                className="bg-slate-900 hover:bg-slate-800 font-bold"
              >
                Delete
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">Removes all units and the model definition.</p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Wipe All */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-bold text-red-900">Dangerous Operation</h4>
            </div>
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              Use this option to completely reset your inventory. This will delete all models and all chassis numbers from the system.
            </p>
            <Button 
              variant="destructive" 
              className="w-full h-10 bg-red-600 hover:bg-red-700 font-bold"
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete ALL Cars & Models"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
