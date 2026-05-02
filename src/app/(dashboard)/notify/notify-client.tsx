"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Users, 
  History, 
  Search,
  MessageSquare,
  Sparkles,
  Loader2,
  Check,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendBulkMarketingSMS } from "@/lib/actions/marketing";
import { format } from "date-fns";
import { toast } from "sonner";

export function NotifyClient({ 
  customers, 
  initialLogs, 
  templates 
}: { 
  customers: any[], 
  initialLogs: any[], 
  templates: any[] 
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const handleSend = () => {
    if (selectedIds.length === 0 || !message) {
      toast.error("Please select recipients and enter a message");
      return;
    }
    
    startTransition(async () => {
      try {
        await sendBulkMarketingSMS(selectedIds, message);
        toast.success(`Campaign launched to ${selectedIds.length} recipients`);
        setMessage("");
        setSelectedIds([]);
      } catch (e) {
        toast.error("Failed to launch campaign");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns</h1>
          <p className="text-sm font-medium text-slate-500">Reach your customers via instant SMS notifications.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SMS Balance</span>
            <span className="text-sm font-bold text-slate-900">Unlimited</span>
          </div>
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-100">
            <Send className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composition Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Message Content</h2>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                message.length > 160 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
              )}>
                {message.length} / 160 characters
              </span>
            </div>

            <div className="space-y-4">
              <textarea 
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[160px] bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder:text-slate-400"
              />

              <div className="flex flex-wrap gap-2">
                {templates.filter(t => t.name.startsWith('MARKETING')).map((template) => (
                  <button 
                    key={template.id}
                    onClick={() => setMessage(template.content)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" /> {template.name.split('_')[1].toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm flex flex-col h-[500px]">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Users className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Recipients ({selectedIds.length})</h2>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input 
                    placeholder="Search customers..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-40 pl-9 pr-4 rounded-xl bg-slate-50 border-none text-[11px] font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAll}
                  className="h-9 px-4 text-[10px] font-bold uppercase border-slate-200"
                >
                  {selectedIds.length === filteredCustomers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id}
                    onClick={() => toggleSelect(customer.id)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                      selectedIds.includes(customer.id) 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm",
                        selectedIds.includes(customer.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {customer.name.substring(0, 1)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{customer.name.split(" - ")[0]}</span>
                        <span className="text-[10px] font-medium text-slate-400">+{customer.phone}</span>
                      </div>
                    </div>
                    {selectedIds.includes(customer.id) && (
                      <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 rounded-b-3xl">
              <Button 
                disabled={selectedIds.length === 0 || !message || isPending}
                onClick={handleSend}
                className="w-full h-12 bg-slate-900 hover:bg-blue-600 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all"
              >
                {isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>Send to {selectedIds.length} Customers</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-6 border-b bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 mb-1">
                <History className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Live Logs</h2>
              </div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Real-time delivery status</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {initialLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                  <Layout className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-[10px] font-bold uppercase text-slate-400">Queue is empty</p>
                </div>
              ) : (
                initialLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-tight">+{log.to}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                          {format(new Date(log.createdAt), "MMM dd • HH:mm")}
                        </span>
                      </div>
                      <div className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                        log.status === "success" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-rose-50 text-rose-600"
                      )}>
                        {log.status}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic font-medium">
                      "{log.message}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
