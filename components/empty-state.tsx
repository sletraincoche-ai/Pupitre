import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-vine/10 text-vine">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 font-heading text-xl text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button
          className="mt-6 bg-gold text-white hover:bg-gold/90"
          nativeButton={false}
          render={<Link href={actionHref}>{actionLabel}</Link>}
        />
      )}
      {actionLabel && !actionHref && onAction && (
        <Button
          className="mt-6 bg-gold text-white hover:bg-gold/90"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
