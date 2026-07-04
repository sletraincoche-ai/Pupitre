import Link from "next/link";
import { cn } from "@/lib/utils";

export function StudioTile({
  href,
  className,
  badge,
  children,
}: {
  href: string;
  className?: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[22px] p-6 transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      {children}
    </Link>
  );
}
