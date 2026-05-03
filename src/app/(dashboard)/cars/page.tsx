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
import { Car, Filter, Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditPriceDialog } from "./edit-price-dialog";
import { cn } from "@/lib/utils";

import { BulkPriceDialog } from "./bulk-price-dialog";
import { BulkManageDialog } from "./bulk-manage-dialog";
import { CarActions } from "./car-actions";
import { SearchInput } from "@/components/search-input";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

async function getCars(page = 1, search = "", status = "all") {
  const limit = 10;
  const skip = (page - 1) * limit;

  let where: any = {};

  if (search) {
    where.OR = [
      { chassisNumber: { contains: search } },
      { model: { name: { contains: search } } },
    ];
  }

  if (status === "available") {
    where.status = "AVAILABLE";
    where.isLocked = false;
  } else if (status === "reserved") {
    where.status = "RESERVED";
  } else if (status === "locked") {
    where.isLocked = true;
  } else if (status === "sold") {
    where.status = "SOLD";
  }

  const [total, cars, counts] = await Promise.all([
    prisma.carUnit.count({ where }),
    prisma.carUnit.findMany({
      where,
      include: {
        model: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.$transaction([
      prisma.carUnit.count(),
      prisma.carUnit.count({ where: { status: "AVAILABLE", isLocked: false } }),
      prisma.carUnit.count({ where: { status: "RESERVED" } }),
      prisma.carUnit.count({ where: { isLocked: true } }),
      prisma.carUnit.count({ where: { status: "SOLD" } }),
    ])
  ]);

  return { 
    cars, 
    total, 
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    counts: {
      all: counts[0],
      available: counts[1],
      reserved: counts[2],
      locked: counts[3],
      sold: counts[4]
    }
  };
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

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const { q: search = "", page: pageStr = "1", status = "all" } = await searchParams;
  const page = parseInt(pageStr) || 1;
  const [{ cars, total, totalPages, counts }, models] = await Promise.all([
    getCars(page, search, status),
    getModelsSummary(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Car Inventory</h1>
          <p className="text-slate-500 font-medium">View and manage all individual car units ({total} total)</p>
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

      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-fit border">
        {[
          { label: "All", value: "all", count: counts.all },
          { label: "Available", value: "available", count: counts.available },
          { label: "Reserved", value: "reserved", count: counts.reserved },
          { label: "Locked", value: "locked", count: counts.locked },
          { label: "Sold", value: "sold", count: counts.sold },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/cars?status=${tab.value}${search ? `&q=${search}` : ""}`}
            className={cn(
              "px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all",
              status === tab.value
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {tab.label}
            <span className="ml-2 opacity-50">({tab.count})</span>
          </Link>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchInput 
              placeholder="Search by chassis or model..." 
              defaultValue={search}
            />
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
                        <div className="flex flex-col gap-1.5 group">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase w-12">Cash:</span>
                            <span className="font-bold text-slate-900 text-sm">ETB {car.cashPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase w-12">Credit:</span>
                            <span className="font-bold text-blue-600 text-sm">ETB {car.creditPrice.toLocaleString()}</span>
                          </div>
                          <div className="mt-1">
                            <EditPriceDialog 
                              carId={car.id} 
                              currentCashPrice={car.cashPrice} 
                              currentCreditPrice={car.creditPrice} 
                              chassisNumber={car.chassisNumber} 
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={car.status === "AVAILABLE" ? "outline" : "secondary"}
                            className={cn(
                              "w-fit rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase",
                              car.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {car.status}
                          </Badge>
                          {car.isLocked && (
                            <Badge 
                              variant="destructive"
                              className="w-fit rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                            >
                              <Lock className="mr-1 h-2.5 w-2.5" /> LOCKED
                            </Badge>
                          )}
                        </div>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/cars?page=${page - 1}&status=${status}${search ? `&q=${search}` : ""}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50"
              )}
            >
              Previous
            </Link>
            <Link
              href={`/cars?page=${page + 1}&status=${status}${search ? `&q=${search}` : ""}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= totalPages && "pointer-events-none opacity-50"
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
