"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchInput({ placeholder = "Search...", defaultValue = "" }: SearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [value, setValue] = useState(defaultValue);

  // Sync state with prop (for external resets/navigation)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // Only trigger if the value is different from the current param to avoid infinite loops or unnecessary refreshes
    const currentParam = searchParams.get("q") || "";
    if (value === currentParam) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1"); // Reset to page 1 on search
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      replace(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [value, pathname, replace, searchParams]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9 h-9 bg-white"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
