"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { periodOptions, usePeriod } from "@/lib/period-context";

export function PeriodSelect() {
  const { period, setPeriod } = usePeriod();

  return (
    <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue>
          {() => periodOptions.find((option) => option.value === period)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
