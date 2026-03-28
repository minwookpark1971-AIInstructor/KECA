"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  basePath: string;
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({ basePath, placeholder = "검색", defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const separator = basePath.includes("?") ? "&" : "?";
    if (query.trim()) {
      router.push(`${basePath}${separator}q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(basePath);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative max-w-sm ml-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={placeholder}
        />
      </div>
    </form>
  );
}
