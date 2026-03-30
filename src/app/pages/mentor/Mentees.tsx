import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Link } from "react-router";
import { Calendar, MessageSquare, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { fetchMentorMentees, type MentorMenteeListItem } from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

export default function MyMentees() {
  const [mentees, setMentees] = useState<MentorMenteeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorMentees()
      .then(setMentees)
      .catch(() => toast.error("Failed to load mentees"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="mentor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentees</h1>
        <p className="text-gray-600">Track progress and manage relationships</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 border-0 shadow-lg">
              <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      ) : mentees.length === 0 ? (
        <Card className="p-12 border-0 shadow-lg text-center">
          <p className="text-gray-600">No mentees yet. Accepted requests will appear here.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {mentees.map((mentee) => {
            const progress = mentee.sessionsCompleted > 0 ? Math.min(100, mentee.sessionsCompleted * 10 + 20) : 0;
            const nextStr = mentee.nextSession
              ? `${new Date(mentee.nextSession.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ${new Date(mentee.nextSession.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : "No upcoming session";
            return (
              <Card
                key={mentee.id}
                className="p-6 border-0 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mentee.avatarUrl ?? DEFAULT_AVATAR} />
                    <AvatarFallback>{(mentee.name ?? "M")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {mentee.name ?? "Mentee"}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {mentee.sessionsCompleted} session{mentee.sessionsCompleted !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Overall Progress</span>
                    <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {mentee.sessionsCompleted}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Sessions Completed</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={16} className="text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-900">—</span>
                    </div>
                    <p className="text-xs text-gray-600">Achievements</p>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-indigo-600 font-semibold mb-1">Next Session</p>
                  <p className="text-sm text-gray-900">{nextStr}</p>
                </div>

                <div className="flex gap-2">
                  <Link to={`/mentor/mentees/${mentee.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Progress
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info("Messages coming soon!")}
                  >
                    <MessageSquare size={18} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
