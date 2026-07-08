"use client";

import { useRef, useState } from "react";
import { Bell, CalendarCheck, Star, Sparkles, Settings2 } from "lucide-react";
import { notifications as initialNotifications, type Notification } from "@/lib/mock-data";
import { useClickOutside } from "@/lib/use-click-outside";
import { cn } from "@/lib/utils";

const typeIcons: Record<Notification["type"], typeof CalendarCheck> = {
  reservation: CalendarCheck,
  avis: Star,
  contenu: Sparkles,
  systeme: Settings2,
};

export function GlassNotifications() {
  const [items, setItems] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const unreadCount = items.filter((n) => !n.lu).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, lu: true })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.6rem] font-medium text-white ring-2 ring-black/40">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-medium text-white">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-gold hover:underline">
                Tout marquer comme lu
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.map((notification) => {
              const Icon = typeIcons[notification.type];
              return (
                <li key={notification.id}>
                  <button
                    onClick={() => markRead(notification.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10",
                      !notification.lu && "bg-white/5"
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-white">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-white">{notification.message}</span>
                      <span className="mt-0.5 block text-xs text-white/55">{notification.temps}</span>
                    </span>
                    {!notification.lu && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
