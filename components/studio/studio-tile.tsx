import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function StudioTile({
  href,
  image,
  imagePosition = "center",
  imageScale = 1,
  imageTransformOrigin = "center",
  className,
  badge,
  icons,
  children,
}: {
  href: string;
  image: string;
  imagePosition?: string;
  imageScale?: number;
  imageTransformOrigin?: string;
  className?: string;
  badge?: number;
  icons?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-[20px] transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        style={{
          objectPosition: imagePosition,
          transform: imageScale !== 1 ? `scale(${imageScale})` : undefined,
          transformOrigin: imageTransformOrigin,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.35) 60%, transparent)",
        }}
      />

      {badge !== undefined && badge > 0 && (
        <span className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-card text-xs font-semibold text-destructive shadow">
          {badge}
        </span>
      )}

      {icons && <div className="absolute left-4 top-4 flex items-center gap-2">{icons}</div>}

      <div className="relative flex flex-col gap-2 p-5 text-white">{children}</div>
    </Link>
  );
}
