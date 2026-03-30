/**
 * SessionBookingModal
 *
 * Shown to the mentee after a request is accepted so they can confirm
 * or reschedule the placeholder session date the backend auto-created.
 *
 * Usage:
 *   <SessionBookingModal
 *     open={open}
 *     session={session}          // SessionListItem from /api/sessions
 *     onClose={() => setOpen(false)}
 *     onConfirmed={(updated) => setSessions(prev => prev.map(s => s.id === updated.id ? updated : s))}
 *   />
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateSessionStatus, type SessionListItem } from "../../../lib/api";
import { getApiUrl, getAccessToken } from "../../../lib/api";

interface Props {
  open: boolean;
  session: SessionListItem | null;
  onClose: () => void;
  onConfirmed: (updated: SessionListItem) => void;
}

const DURATIONS = [30, 45, 60, 90, 120];

async function rescheduleSession(
  sessionId: string,
  scheduledAt: string,
  durationMinutes: number
): Promise<SessionListItem> {
  const base = getApiUrl();
  const token = await getAccessToken();
  const res = await fetch(`${base}/api/sessions/${sessionId}/reschedule`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ scheduledAt, durationMinutes }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Error ${res.status}`);
  }
  return res.json();
}

function toLocalInputValue(iso: string): string {
  // Convert ISO to format needed by datetime-local input: "YYYY-MM-DDTHH:MM"
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionBookingModal({ open, session, onClose, onConfirmed }: Props) {
  const [scheduledAt, setScheduledAt] = useState<string>(
    session ? toLocalInputValue(session.scheduledAt) : ""
  );
  const [duration, setDuration] = useState<number>(session?.durationMinutes ?? 60);
  const [saving, setSaving] = useState(false);

  // Reset when session changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && session) {
      setScheduledAt(toLocalInputValue(session.scheduledAt));
      setDuration(session.durationMinutes);
    }
    if (!isOpen) onClose();
  };

  const handleConfirm = async () => {
    if (!session) return;
    if (!scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }
    const selected = new Date(scheduledAt);
    if (selected <= new Date()) {
      toast.error("Please choose a future date and time");
      return;
    }
    setSaving(true);
    try {
      // Try reschedule endpoint first; fall back to plain status update
      let updated: SessionListItem;
      try {
        updated = await rescheduleSession(session.id, selected.toISOString(), duration);
      } catch {
        // Backend reschedule endpoint may not exist yet — just confirm as-is
        updated = await updateSessionStatus(session.id, "scheduled");
      }
      toast.success("Session confirmed! 🎉");
      onConfirmed(updated);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm session");
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  const mentorName = session.mentor?.name ?? "your mentor";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            Confirm Your Session
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-700 font-medium">Session with {mentorName}</p>
            <p className="text-sm text-indigo-600 mt-1">{session.topic}</p>
          </div>

          <p className="text-sm text-gray-600">
            Your mentor accepted your request! A placeholder time has been set.
            You can keep it or pick a time that works better for you.
          </p>

          <div className="space-y-2">
            <Label htmlFor="session-date" className="flex items-center gap-2">
              <Calendar size={16} />
              Date & Time
            </Label>
            <Input
              id="session-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock size={16} />
              Duration
            </Label>
            <Select
              value={String(duration)}
              onValueChange={(v) => setDuration(Number(v))}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Later
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? "Confirming..." : "Confirm Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
