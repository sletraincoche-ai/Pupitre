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

export function NotificationsMenu() {
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
        className="relative flex size-9 items-center justify-center rounded-lg text-stone hover:bg-muted hover:text-ink"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-border/70 bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-medium text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-gold hover:underline"
              >
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
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                      !notification.lu && "bg-gold/5"
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-vine/10 text-vine">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">
                        {notification.message}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone">
                        {notification.temps}
                      </span>
                    </span>
                    {!notification.lu && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                    )}
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
