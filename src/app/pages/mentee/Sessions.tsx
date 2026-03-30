import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Link } from "react-router";
import { Calendar, Clock, Video, X, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  RatingModal,
  type SessionInfo,
  type RatingSubmission,
} from "../../components/ui/RatingModal";
import { SessionBookingModal } from "../../components/ui/SessionBookingModal";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import {
  fetchSessions,
  updateSessionStatus,
  submitSessionRating,
  type SessionListItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
const CONFIRMED_SESSIONS_KEY = "mentorme-confirmed-sessions";

function getConfirmedSessionIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CONFIRMED_SESSIONS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markSessionConfirmed(id: string) {
  try {
    const existing = getConfirmedSessionIds();
    existing.add(id);
    localStorage.setItem(CONFIRMED_SESSIONS_KEY, JSON.stringify([...existing]));
  } catch {}
}

export default function MenteeSessions() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratedSessionIds, setRatedSessionIds] = useState<Set<string>>(new Set());
  const [ratingModalSession, setRatingModalSession] = useState<{
    id: string;
    mentor: string;
    topic: string;
    date: string;
  } | null>(null);
  const [bookingSession, setBookingSession] = useState<SessionListItem | null>(null);

  useEffect(() => {
    fetchSessions()
      .then((data) => {
        setSessions(data);
        // Only auto-open booking modal for sessions not yet confirmed by the user
        const confirmed = getConfirmedSessionIds();
        const needsConfirmation = data
          .filter((s) => s.status === "scheduled" && !confirmed.has(s.id))
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];
        if (needsConfirmation) {
          setBookingSession(needsConfirmation);
        }
      })
      .catch(() => {
        toast.error("Failed to load sessions");
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcomingSessions = sessions.filter((s) => {
    const scheduled = new Date(s.scheduledAt);
    return (s.status === "scheduled" || s.status === "in_progress") && scheduled >= now;
  });
  const completedSessions = sessions.filter((s) => {
    const scheduled = new Date(s.scheduledAt);
    return s.status === "completed" || scheduled < now || s.status === "cancelled";
  });

  const handleCancelSession = async (sessionId: string) => {
    try {
      await updateSessionStatus(sessionId, "cancelled");
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: "cancelled" } : s));
      toast.success("Session cancelled");
    } catch {
      toast.error("Failed to cancel session");
    }
  };

  const handleRatingSubmit = (sessionId: string) => (data: RatingSubmission) => {
    submitSessionRating(sessionId, { rating: data.rating, comment: data.comment, tags: data.tags })
      .then(() => {
        setRatedSessionIds((prev) => new Set(prev).add(sessionId));
        toast.success("Rating submitted!");
      })
      .catch(() => toast.error("Failed to submit rating"));
  };

  const sessionInfoForModal: SessionInfo | null = ratingModalSession
    ? { name: ratingModalSession.mentor, date: ratingModalSession.date, topic: ratingModalSession.topic }
    : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatTimeRange = (iso: string, durationMin: number) => {
    const start = new Date(iso);
    const end = new Date(start.getTime() + durationMin * 60 * 1000);
    return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  };

  return (
    <DashboardLayout role="mentee">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">Manage your mentorship sessions</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : upcomingSessions.length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} />}
              title="No upcoming sessions"
              subtitle="Book a session with a mentor to get started."
              actionLabel="Browse Mentors"
              onAction={() => (window.location.href = "/mentors")}
            />
          ) : (
            upcomingSessions.map((session) => (
              <Card key={session.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={session.mentor.avatarUrl ?? DEFAULT_AVATAR} />
                    <AvatarFallback>{(session.mentor.name ?? "M")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{session.topic}</h3>
                        <p className="text-gray-600 mb-2">with {session.mentor.name ?? "Mentor"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={session.status === "in_progress" ? "bg-indigo-50 text-indigo-600 border-0" : "bg-emerald-50 text-emerald-600 border-0"}>
                          {session.status === "in_progress" ? "In progress" : "Confirmed"}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-indigo-600 text-xs"
                          onClick={() => setBookingSession(session)}>
                          Reschedule
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      <span className="flex items-center gap-2"><Calendar size={18} />{formatDate(session.scheduledAt)}</span>
                      <span className="flex items-center gap-2"><Clock size={18} />{formatTimeRange(session.scheduledAt, session.durationMinutes)}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/session/${session.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Video size={18} className="mr-2" /> Join Session
                        </Button>
                      </Link>
                      {session.status !== "cancelled" && (
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleCancelSession(session.id)}>
                          <X size={18} className="mr-2" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : completedSessions.length === 0 ? (
            <EmptyState icon={<Calendar size={48} />} title="No completed sessions yet"
              subtitle="Completed sessions will appear here." />
          ) : (
            completedSessions.map((session) => (
              <Card key={session.id} className="p-6 border-0 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={session.mentor.avatarUrl ?? DEFAULT_AVATAR} />
                    <AvatarFallback>{(session.mentor.name ?? "M")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{session.topic}</h3>
                        <p className="text-gray-600 mb-2">with {session.mentor.name ?? "Mentor"}</p>
                      </div>
                      <Badge className={session.status === "cancelled" ? "bg-red-50 text-red-600 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                        {session.status === "cancelled" ? "Cancelled" : "Completed"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                      <span className="flex items-center gap-2"><Calendar size={18} />{formatDate(session.scheduledAt)}</span>
                      <span className="flex items-center gap-2"><Clock size={18} />{session.durationMinutes} min</span>
                    </div>
                    {session.status !== "cancelled" && (
                      <div className="flex flex-wrap gap-3">
                        {ratedSessionIds.has(session.id) ? (
                          <Button variant="outline" disabled className="text-emerald-600 border-emerald-200">
                            <Star size={18} className="mr-2 fill-yellow-400 text-yellow-400" /> Rated ✓
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => setRatingModalSession({
                            id: session.id, mentor: session.mentor.name ?? "Mentor",
                            topic: session.topic, date: formatDate(session.scheduledAt),
                          })}>
                            <Star size={18} className="mr-2" /> Rate Session
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => toast.info("Opening chat...")}>
                          <MessageSquare size={18} className="mr-2" /> Message Mentor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <SessionBookingModal
        open={!!bookingSession}
        session={bookingSession}
        onClose={() => {
          if (bookingSession) markSessionConfirmed(bookingSession.id);
          setBookingSession(null);
        }}
        onConfirmed={(updated) => {
          setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
          if (bookingSession) markSessionConfirmed(bookingSession.id);
          setBookingSession(null);
        }}
      />

      <RatingModal
        isOpen={!!ratingModalSession}
        onClose={() => setRatingModalSession(null)}
        onSubmit={ratingModalSession ? handleRatingSubmit(ratingModalSession.id) : () => {}}
        sessionInfo={sessionInfoForModal}
      />
    </DashboardLayout>
  );
}
