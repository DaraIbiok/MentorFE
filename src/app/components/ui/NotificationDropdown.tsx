import { useState, useEffect, useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";
import {
  Bell, MessageSquare, Calendar, UserCheck,
  CheckCircle2, Clock, AlertCircle, Trash2,
} from "lucide-react";
import { getApiUrl, getAccessToken } from "../../../lib/api";

export type NotificationType = "message" | "session" | "request" | "system";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

// ── Time formatting ────────────────────────────────────────────────────────────
function timeAgo(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── API helpers ────────────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
  const base = getApiUrl();
  const token = await getAccessToken();
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

async function fetchNotificationsApi(): Promise<Notification[]> {
  const res = await apiFetch("/api/notifications");
  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map((n) => ({
    id: n.id,
    type: (n.type as NotificationType) || "system",
    title: n.title,
    description: n.description,
    createdAt: n.createdAt ?? n.created_at,
    read: n.read,
  }));
}

async function markReadApi(id: string) {
  await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
}

async function markAllReadApi() {
  await apiFetch("/api/notifications/read-all", { method: "PATCH" });
}

async function deleteNotificationApi(id: string) {
  await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
}

// ── Icon helper ────────────────────────────────────────────────────────────────
const getIcon = (type: NotificationType) => {
  switch (type) {
    case "message": return <MessageSquare size={18} className="text-indigo-600" />;
    case "session": return <Calendar size={18} className="text-emerald-600" />;
    case "request": return <UserCheck size={18} className="text-blue-600" />;
    default: return <AlertCircle size={18} className="text-amber-600" />;
  }
};

// ── Component ──────────────────────────────────────────────────────────────────
export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotificationsApi();
      setNotifications(data);
    } catch {}
  }, []);

  // Load on mount and poll every 30 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await markReadApi(id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllReadApi().catch(() => {});
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotificationApi(id).catch(() => {});
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) load(); }}>
      <PopoverTrigger asChild>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 border-0 shadow-lg" sideOffset={8}>
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost" size="sm"
                onClick={handleMarkAllRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">You're all caught up!</p>
                <p className="text-sm text-gray-500 mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors group ${
                      n.read ? "bg-white" : "bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm ${n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.read && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1" />}
                            <span
                              onClick={(e) => handleDelete(e, n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1.5 line-clamp-2">{n.description}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {n.createdAt ? timeAgo(n.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}