import { useState, useEffect } from "react";
import { Link } from "react-router";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import { Clock, Plus, Star, CalendarDays } from "lucide-react";
import {
  RatingModal,
  type SessionInfo,
  type RatingSubmission,
} from "../../components/ui/RatingModal";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { fetchSessions, submitSessionRating, type SessionListItem } from "../../../lib/api";
import { toast } from "sonner";

export default function SessionManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratedSessionIds, setRatedSessionIds] = useState<Set<string>>(new Set());
  const [ratingModalSession, setRatingModalSession] = useState<{
    id: string;
    menteeName: string;
    topic: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = sessions.filter(
    (s) =>
      (s.status === "scheduled" || s.status === "in_progress") &&
      new Date(s.scheduledAt) >= now
  );
  const completed = sessions.filter((s) => s.status === "completed");

  const handleAddAvailability = () => {
    // Placeholder – could open a modal or link to settings
  };

  return (
    <DashboardLayout role="mentor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
        <p className="text-gray-600">Manage your availability and schedule</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calendar</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <div className="mt-6 space-y-3">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleAddAvailability}
            >
              <Plus size={18} className="mr-2" />
              Add Availability
            </Button>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-gray-600">Booked</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={<Calendar size={48} />}
                title="No upcoming sessions"
                subtitle="Sessions will appear here when mentees book with you."
              />
            ) : (
              <div className="space-y-4">
                {upcoming.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 bg-gray-50/50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{session.topic}</p>
                      <p className="text-sm text-gray-600">
                        with {session.mentee.name ?? "Mentee"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <CalendarDays size={14} />
                        {new Date(session.scheduledAt).toLocaleDateString("en-US")} at{" "}
                        {new Date(session.scheduledAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Link to={`/session/${session.id}`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Clock size={18} className="mr-2" />
                        Join Session
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Sessions</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50"
                  >
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : completed.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={48} />}
                title="No sessions yet"
                subtitle="Completed sessions will appear here after you finish them."
              />
            ) : (
              <div className="space-y-4">
                {completed.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{session.topic}</p>
                      <p className="text-sm text-gray-600">
                        with {session.mentee.name ?? "Mentee"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <CalendarDays size={14} />
                        {new Date(session.scheduledAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div>
                      {ratedSessionIds.has(session.id) ? (
                        <Button
                          variant="outline"
                          disabled
                          className="text-emerald-600 border-emerald-200"
                        >
                          <Star size={18} className="mr-2 fill-yellow-400 text-yellow-400" />
                          Rated ✓
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setRatingModalSession({
                              id: session.id,
                              menteeName: session.mentee.name ?? "Mentee",
                              topic: session.topic,
                              date: new Date(session.scheduledAt).toLocaleDateString("en-US"),
                            })
                          }
                        >
                          <Star size={18} className="mr-2" />
                          Rate Session
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <RatingModal
        isOpen={!!ratingModalSession}
        onClose={() => setRatingModalSession(null)}
        onSubmit={
          ratingModalSession
            ? (data: RatingSubmission) => {
                submitSessionRating(ratingModalSession.id, {
                  rating: data.rating,
                  comment: data.comment,
                  tags: data.tags,
                })
                  .then(() => {
                    setRatedSessionIds((prev) => new Set(prev).add(ratingModalSession.id));
                  })
                  .catch(() => toast.error("Failed to submit rating"));
              }
            : () => {}
        }
        sessionInfo={
          ratingModalSession
            ? {
                name: ratingModalSession.menteeName,
                date: ratingModalSession.date,
                topic: ratingModalSession.topic,
              }
            : null
        }
      />
    </DashboardLayout>
  );
}
