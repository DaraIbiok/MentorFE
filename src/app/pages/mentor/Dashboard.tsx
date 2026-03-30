import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Link, useNavigate } from "react-router";
import {
  Users,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchSessions,
  fetchMentorRequests,
  respondMentorshipRequest,
  type SessionListItem,
  type MentorshipRequestItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [requests, setRequests] = useState<MentorshipRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSessions(), fetchMentorRequests()])
      .then(([sess, req]) => {
        setSessions(sess);
        setRequests(req);
      })
      .catch(() => {
        toast.error("Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const upcomingSessions = sessions
    .filter(
      (s) =>
        (s.status === "scheduled" || s.status === "in_progress") &&
        new Date(s.scheduledAt) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(0, 5);

  const menteeIds = new Set(sessions.map((s) => s.menteeId));
  const activeMenteesCount = menteeIds.size;
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const activeMenteesList = Array.from(menteeIds)
    .map((menteeId) => {
      const sess = sessions.filter((s) => s.menteeId === menteeId);
      const completed = sess.filter((s) => s.status === "completed").length;
      const next = sess
        .filter(
          (s) =>
            ["scheduled", "in_progress"].includes(s.status) &&
            new Date(s.scheduledAt) >= now
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        )[0];
      const session = sess[0];
      return {
        id: menteeId,
        name: session?.mentee?.name ?? "Mentee",
        image: session?.mentee?.avatarUrl ?? DEFAULT_AVATAR,
        progress: totalSessions ? Math.min(100, Math.round((completed / Math.max(1, sess.length)) * 100) + 20) : 0,
        sessionsCompleted: completed,
        nextSession: next
          ? `${new Date(next.scheduledAt).toLocaleDateString("en-US", { weekday: "short" })} ${new Date(next.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
          : "—",
      };
    })
    .slice(0, 3);

  const handleAcceptRequest = async (req: MentorshipRequestItem) => {
    try {
      await respondMentorshipRequest(req.id, "accepted");
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "accepted" } : r)));
      toast.success(`Request from ${req.mentee.name ?? "mentee"} accepted!`);
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineRequest = async (req: MentorshipRequestItem) => {
    try {
      await respondMentorshipRequest(req.id, "declined");
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  const handleViewAnalytics = () => {
    toast.info("Analytics dashboard coming soon!");
  };

  const formatRequestDate = (iso: string) => {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout role="mentor">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
        <p className="text-gray-600">Manage your mentees and track your impact</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="text-indigo-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{activeMenteesCount}</p>
          <p className="text-gray-600 text-sm">Active Mentees</p>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="text-emerald-600" size={24} />
            </div>
            {upcomingSessions.length > 0 && (
              <Badge className="bg-orange-50 text-orange-600 border-0">
                {upcomingSessions.filter((s) => new Date(s.scheduledAt).toDateString() === now.toDateString()).length} today
              </Badge>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalSessions}</p>
          <p className="text-gray-600 text-sm">Total Sessions</p>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">—</p>
          <p className="text-gray-600 text-sm">Average Rating</p>
        </Card>
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">—</p>
          <p className="text-gray-600 text-sm">This Month</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Requests
                <Badge className="ml-3 bg-orange-50 text-orange-600 border-0">
                  {pendingRequests.length}
                </Badge>
              </h2>
              <Link to="/mentor/requests">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending requests.</p>
              ) : (
                pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={request.mentee.avatarUrl ?? DEFAULT_AVATAR} />
                        <AvatarFallback>{(request.mentee.name ?? "M")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{request.mentee.name ?? "Mentee"}</p>
                        <p className="text-sm text-gray-600 mb-1">{request.topic}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{request.message}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {formatRequestDate(request.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleAcceptRequest(request)}
                            >
                              <CheckCircle2 size={16} className="mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeclineRequest(request)}
                            >
                              <XCircle size={16} className="mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/mentor/sessions">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  Manage Schedule
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming sessions.</p>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentee.avatarUrl ?? DEFAULT_AVATAR} />
                        <AvatarFallback>{(session.mentee.name ?? "M")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {session.mentee.name ?? "Mentee"}
                            </p>
                            <p className="text-gray-600 text-sm mb-2">{session.topic}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(session.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                                {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.durationMinutes} min
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleStartSession(session.id)}
                          >
                            Start Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Mentees</h2>
              <Link to="/mentor/mentees">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {activeMenteesList.length === 0 ? (
                <p className="text-gray-500 text-sm">No mentees yet.</p>
              ) : (
                activeMenteesList.map((mentee) => (
                  <Link
                    key={mentee.id}
                    to={`/mentor/mentees/${mentee.id}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mentee.image} />
                        <AvatarFallback>{mentee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{mentee.name}</p>
                        <p className="text-sm text-gray-600">{mentee.sessionsCompleted} sessions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{mentee.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${mentee.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Next: {mentee.nextSession}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
            <h3 className="font-bold text-lg mb-4">Your Impact</h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-3xl font-bold">{totalSessions}</p>
                <p className="text-indigo-100 text-sm">Total Sessions</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{completedSessions.length}</p>
                <p className="text-indigo-100 text-sm">Completed</p>
              </div>
            </div>
            <Button
              className="w-full bg-white hover:bg-gray-100 text-indigo-600"
              onClick={handleViewAnalytics}
            >
              View Analytics
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
