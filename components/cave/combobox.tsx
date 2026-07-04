"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/lib/use-click-outside";
import { cn } from "@/lib/utils";

export type ComboboxItem = { id: string; label: string; sublabel?: string };

export function Combobox({
  items,
  initialQuery = "",
  onSelect,
  onQueryChange,
  placeholder,
  allowCreate = false,
  onCreate,
  emptyLabel = "Aucun résultat.",
}: {
  items: ComboboxItem[];
  initialQuery?: string;
  onSelect: (item: ComboboxItem) => void;
  onQueryChange?: (query: string) => void;
  placeholder: string;
  allowCreate?: boolean;
  onCreate?: (query: string) => void;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q)
      )
    : items;
  const exactMatch = items.some((item) => item.label.toLowerCase() === q);

  return (
    <div ref={ref} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border/70 bg-card shadow-lg">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                setQuery(item.label);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
              )}
            >
              <span className="text-ink">{item.label}</span>
              {item.sublabel && (
                <span className="text-xs text-stone">{item.sublabel}</span>
              )}
            </button>
          ))}
          {allowCreate && q && !exactMatch && (
            <button
              type="button"
              onClick={() => {
                onCreate?.(query.trim());
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-2 text-left text-sm text-gold hover:bg-gold/5"
            >
              <Plus className="size-3.5" />
              Créer « {query.trim()} »
            </button>
          )}
          {filtered.length === 0 && !(allowCreate && q && !exactMatch) && (
            <p className="px-3 py-2 text-sm text-stone">{emptyLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
