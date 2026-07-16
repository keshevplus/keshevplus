import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Client } from "@shared/schema";

interface LeadSearchBarProps {
  onSelectClient: (clientId: number) => void;
}

export default function LeadSearchBar({ onSelectClient }: LeadSearchBarProps) {
  const { language } = useLanguage();
  const isHe = language === "he";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qDigits = q.replace(/\D/g, "");
    return clients
      .filter((client) => {
        if (client.name?.toLowerCase().includes(q)) return true;
        if (client.email?.toLowerCase().includes(q)) return true;
        if (qDigits && client.phone?.replace(/\D/g, "").includes(qDigits)) return true;
        if (client.leadNumber != null && String(client.leadNumber).includes(q)) return true;
        if (client.clientNumber != null && String(client.clientNumber).includes(q)) return true;
        return false;
      })
      .slice(0, 8);
  }, [clients, query]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={isHe ? "חיפוש ליד/לקוח לפי שם, אימייל, טלפון או מספר" : "Search leads/clients by name, email, phone or number"}
        className="ps-9 h-10"
        data-testid="input-search-overview"
      />
      {open && query.trim() && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">{isHe ? "לא נמצאו תוצאות" : "No results found"}</div>
          ) : (
            results.map((client) => (
              <button
                key={client.id}
                type="button"
                onMouseDown={() => {
                  onSelectClient(client.id);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-start hover-elevate"
                data-testid={`search-result-client-${client.id}`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate font-medium">{client.name}</span>
                  {client.email && <span className="truncate text-xs text-muted-foreground">{client.email}</span>}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {client.clientNumber != null ? `#${client.clientNumber}` : client.leadNumber != null ? `#${client.leadNumber}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
