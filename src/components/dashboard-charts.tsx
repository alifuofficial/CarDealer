"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { name: "Jan", cars: 400, customers: 240 },
  { name: "Feb", cars: 300, customers: 139 },
  { name: "Mar", cars: 500, customers: 480 },
  { name: "Apr", cars: 278, customers: 390 },
  { name: "May", cars: 489, customers: 580 },
  { name: "Jun", cars: 639, customers: 480 },
];

const statusData = [
  { name: "Available", value: 400, color: "#3b82f6" }, // Blue
  { name: "Reserved", value: 300, color: "#6366f1" },  // Indigo
  { name: "Sold", value: 200, color: "#f43f5e" },       // Rose
];

export function InventoryChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "12px", 
              border: "none", 
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              backgroundColor: "#ffffff",
              fontSize: "11px",
              fontWeight: "bold",
              color: "#1e293b"
            }} 
            itemStyle={{ padding: "2px 0" }}
          />
          <Area 
            type="monotone" 
            dataKey="cars" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCars)" 
          />
          <Area 
            type="monotone" 
            dataKey="customers" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorLeads)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDistributionChart({ data }: { data: any[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  return (
    <div className="h-full w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: "12px", 
              border: "none", 
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              backgroundColor: "#ffffff",
              fontSize: "11px",
              fontWeight: "bold"
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
        <span className="text-xl font-bold text-slate-900">{total}</span>
      </div>
    </div>
  );
}
