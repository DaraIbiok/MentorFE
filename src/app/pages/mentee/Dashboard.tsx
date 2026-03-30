import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Link } from "react-router";
import {
  TrendingUp,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Star,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import {
  fetchSessions,
  fetchRecommendedMentors,
  fetchMentors,
  type SessionListItem,
  type MentorListItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

function formatSessionDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  const diff = Math.round((dDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSessionTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<MentorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = 0;
    const checkDone = () => {
      done++;
      if (done >= 2) setLoading(false);
    };

    fetchSessions()
      .then(setSessions)
      .catch(() => toast.error("Failed to load sessions"))
      .finally(checkDone);

    fetchRecommendedMentors()
      .then((list) => setRecommendedMentors(list.slice(0, 3)))
      .catch(() => fetchMentors().then((list) => setRecommendedMentors(list.slice(0, 3))))
      .finally(checkDone);
  }, []);

  const now = new Date();
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

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const uniqueMentorIds = new Set(sessions.map((s) => s.mentorId));
  const activeMentorsCount = uniqueMentorIds.size;
  const goalProgress =
    totalSessions > 0
      ? Math.min(100, Math.round((completedSessions.length / totalSessions) * 100))
      : 0;
  const learningHours = Math.round(completedSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 60), 0) / 60);

  if (loading) {
    return (
      <DashboardLayout role="mentee">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mentee">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.trim() || "there"}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your mentorship journey
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Calendar className="text-indigo-600" size={24} />
            </div>
            {upcomingSessions.length > 0 && (
              <Badge className="bg-emerald-50 text-emerald-600 border-0">
                {upcomingSessions.length} upcoming
              </Badge>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalSessions}</p>
          <p className="text-gray-600 text-sm">Total Sessions</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Users className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{activeMentorsCount}</p>
          <p className="text-gray-600 text-sm">Active Mentors</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{goalProgress}%</p>
          <p className="text-gray-600 text-sm">Goal Progress</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{learningHours}h</p>
          <p className="text-gray-600 text-sm">Learning Time</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/sessions">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-500 py-4">No upcoming sessions. Book a mentor to get started.</p>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentor.avatarUrl ?? DEFAULT_AVATAR} />
                        <AvatarFallback>{(session.mentor.name ?? "M")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {session.mentor.name ?? "Mentor"}
                            </p>
                            <p className="text-gray-600 text-sm mb-2">{session.topic}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatSessionDate(session.scheduledAt)} at{" "}
                                {formatSessionTime(session.scheduledAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.durationMinutes} min
                              </span>
                            </div>
                          </div>
                          <Link to={`/session/${session.id}`}>
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Video size={16} className="mr-2" />
                              Join
                            </Button>
                          </Link>
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
              <h2 className="text-xl font-bold text-gray-900">Current Goals</h2>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  Edit in Settings
                </Button>
              </Link>
            </div>
            <p className="text-gray-600 text-sm">
              Set your skills and goals in Settings to get better mentor recommendations.
            </p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
              <Link to="/mentors">
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  Browse All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recommendedMentors.length === 0 ? (
                <p className="text-gray-500 text-sm">No recommendations yet. Add your goals in Settings.</p>
              ) : (
                recommendedMentors.map((mentor) => (
                  <Link
                    key={mentor.id}
                    to={`/mentors/${mentor.id}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.avatarUrl ?? DEFAULT_AVATAR} />
                        <AvatarFallback>{(mentor.name ?? "M")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {mentor.name ?? "Mentor"}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">{mentor.bio ?? ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        {mentor.averageRating != null ? mentor.averageRating.toFixed(1) : "—"}
                      </span>
                      <span>{mentor.ratingCount ?? 0} reviews</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(mentor.skills ?? []).slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
            <h3 className="font-bold text-lg mb-4">Need Help?</h3>
            <p className="text-indigo-100 mb-6 text-sm">
              Book a session with one of our expert mentors and get personalized guidance.
            </p>
            <Link to="/mentors">
              <Button className="w-full bg-white hover:bg-gray-100 text-indigo-600">
                Find a Mentor
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
