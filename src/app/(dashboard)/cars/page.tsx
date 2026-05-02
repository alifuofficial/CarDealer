import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditPriceDialog } from "./edit-price-dialog";
import { cn } from "@/lib/utils";

import { BulkPriceDialog } from "./bulk-price-dialog";
import { BulkManageDialog } from "./bulk-manage-dialog";
import { CarActions } from "./car-actions";

async function getCars() {
  return await prisma.carUnit.findMany({
    include: {
      model: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getModelsSummary() {
  const models = await prisma.carModel.findMany({
    include: {
      units: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return models;
}

export default async function CarsPage() {
  const [cars, models] = await Promise.all([getCars(), getModelsSummary()]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Car Inventory</h1>
          <p className="text-slate-500 font-medium">View and manage all individual car units</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900">Inventory Management</h3>
          <p className="text-[11px] text-slate-500 font-medium">Batch pricing and bulk administrative actions</p>
        </div>
        <div className="flex gap-2">
          <BulkPriceDialog models={models} />
          <BulkManageDialog models={models} />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by chassis number or model..."
                className="pl-9 bg-slate-50 border-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b">
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Model</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Chassis Number</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit Price</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Import Date</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No cars found in the system.
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                      <TableCell className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          {car.model.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-mono text-[11px] font-bold text-slate-600">
                        {car.chassisNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">ETB {car.unitPrice.toLocaleString()}</span>
                          <EditPriceDialog carId={car.id} currentPrice={car.unitPrice} chassisNumber={car.chassisNumber} />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge 
                          variant={car.status === "AVAILABLE" ? "outline" : "secondary"}
                          className={cn(
                            "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase",
                            car.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-500 text-[11px] font-medium">
                        {new Date(car.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <CarActions car={car} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
