"use client";

import React, { useRef, useState } from "react";
import { 
  Download, 
  Upload, 
  FileJson, 
  FileText, 
  Table as TableIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { createCustomer, getAllCustomers } from "@/lib/actions/customers";
import { useRouter } from "next/navigation";

interface CustomerDataToolsProps {
  customers: any[];
  search?: string;
}

export function CustomerDataTools({ customers, search }: CustomerDataToolsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const getFullData = async () => {
    setIsExporting(true);
    try {
      const allCustomers = await getAllCustomers(search);
      return allCustomers.map(c => ({
        Name: c.name,
        Phone: c.phone,
        Type: c.type,
        Added_On: new Date(c.createdAt).toLocaleDateString()
      }));
    } catch (error) {
      toast.error("Failed to fetch all customers for export");
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportCSV = async () => {
    const data = await getFullData();
    if (!data) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `customers_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  // Export to Excel
  const exportExcel = async () => {
    const data = await getFullData();
    if (!data) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `customers_${new Date().getTime()}.xlsx`);
    toast.success("Excel exported successfully");
  };

  // Export to PDF
  const exportPDF = async () => {
    const data = await getFullData();
    if (!data) return;

    const doc = new jsPDF();
    doc.text("Customer List", 14, 15);
    
    const tableData = data.map(c => [
      c.Name,
      c.Phone,
      c.Type,
      c.Added_On
    ]);

    autoTable(doc, {
      head: [['Name', 'Phone', 'Type', 'Added On']],
      body: tableData,
      startY: 20,
    });

    doc.save(`customers_${new Date().getTime()}.pdf`);
    toast.success("PDF exported successfully");
  };

  // Handle Import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result;
      if (!content) return;

      try {
        let results: any[] = [];

        if (file.name.endsWith(".csv")) {
          const parsed = Papa.parse(content as string, { header: true });
          results = parsed.data;
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const workbook = XLSX.read(content, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          results = XLSX.utils.sheet_to_json(worksheet);
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of results) {
          const name = row.Name || row.name || row.Customer;
          const phone = row.Phone || row.phone || row.Mobile;
          const type = (row.Type || row.type || "INDIVIDUAL").toUpperCase();

          if (name && phone) {
            try {
              const fd = new FormData();
              fd.append("name", name);
              fd.append("phone", phone);
              fd.append("type", type);
              await createCustomer(fd);
              successCount++;
            } catch (err) {
              failCount++;
            }
          }
        }

        toast.success(`Import complete: ${successCount} added, ${failCount} failed.`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to parse file. Ensure it follows the correct format.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
        accept=".csv, .xlsx, .xls"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting || isExporting}
      >
        {isImporting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-2 h-3 w-3" />}
        Import
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button 
              disabled={isExporting}
              className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-slate-100"
            >
              {isExporting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Download className="mr-2 h-3 w-3" />}
              Export
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 py-2">Select Format</DropdownMenuLabel>
            <DropdownMenuItem onClick={exportCSV} className="rounded-lg cursor-pointer">
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              CSV Spreadsheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportExcel} className="rounded-lg cursor-pointer">
              <TableIcon className="mr-2 h-4 w-4 text-emerald-500" />
              Excel Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPDF} className="rounded-lg cursor-pointer">
              <FileJson className="mr-2 h-4 w-4 text-red-500" />
              PDF Report
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
