import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepPills({ total, courant }: { total: number; courant: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-[11px] font-medium",
            i < courant
              ? "bg-vine text-white"
              : i === courant
                ? "bg-gold text-white"
                : "bg-muted text-stone"
          )}
        >
          {i < courant ? <Check className="size-3" /> : i + 1}
        </span>
      ))}
    </div>
  );
}
