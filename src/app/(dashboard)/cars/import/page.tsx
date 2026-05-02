"use client";

import { importCarBatch } from "@/lib/actions/cars";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus } from "lucide-react";
import { useState } from "react";

export default function ImportCarsPage() {
  const [mode, setMode] = useState<"auto" | "manual" | "csv">("auto");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Car Batch</h1>
        <p className="text-slate-500">Create a new car model and generate multiple units</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-600">
            <Car className="h-5 w-5" />
            <CardTitle>Batch Details</CardTitle>
          </div>
          <CardDescription>
            Enter the car model name and how many units you are importing. Choose a mode below: manual chassis, CSV import, or auto-generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <span>Import mode:</span>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "auto"} onChange={() => setMode("auto")} /> Auto-generated
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "manual"} onChange={() => setMode("manual")} /> Manual Chassis
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === "csv"} onChange={() => setMode("csv")} /> CSV Upload
            </label>
          </div>
          <form action={importCarBatch} className="space-y-6">
            {mode !== "csv" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelName">Car Model Name</Label>
                  <Input
                    id="modelName"
                    name="modelName"
                    placeholder="e.g. Corolla 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (ETB)</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    placeholder="e.g. 2500000"
                    required
                  />
                </div>
              </div>
            )}
            {mode === "auto" && (
              <div className="space-y-2">
                <Label htmlFor="totalUnits">Total Units</Label>
                <Input
                  id="totalUnits"
                  name="totalUnits"
                  type="number"
                  min="1"
                  max="500"
                  placeholder="e.g. 100"
                  required
                />
              </div>
            )}
            {mode === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="manualChassis">Chassis (one per line or comma separated)</Label>
                <textarea id="manualChassis" name="manualChassis" placeholder="ABC-001\nABC-002" rows={4} className="w-full border rounded p-2" required />
              </div>
            )}
            {mode === "csv" && (
              <div className="space-y-2">
                <Label htmlFor="importFile">CSV File</Label>
                <Input id="importFile" name="importFile" type="file" accept=".csv" required />
                <p className="text-xs text-slate-500">CSV with columns: chassisNumber, modelName</p>
              </div>
            )}
            <div className="pt-4">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                <Plus className="mr-2 h-4 w-4" />
                Import Batch & Generate Units
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
        <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5 font-bold">i</div>
        <p>
          CSV/Excel import: you can export from Excel to CSV for bulk import. Manual input allows you to specify exact chassis numbers.
        </p>
      </div>
    </div>
  );
}
