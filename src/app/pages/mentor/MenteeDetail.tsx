import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Calendar, MessageSquare, Target, Clock } from "lucide-react";
import { toast } from "sonner";
import { fetchMentorMentee, type MentorMenteeDetail } from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

export default function MenteeDetail() {
  const { id } = useParams<{ id: string }>();
  const [mentee, setMentee] = useState<MentorMenteeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchMentorMentee(id)
      .then(setMentee)
      .catch(() => toast.error("Failed to load mentee"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleScheduleSession = () => {
    toast.success("Schedule session dialog coming soon!");
  };

  const handleSendMessage = () => {
    toast.info("Opening messages...");
  };

  if (loading) {
    return (
      <DashboardLayout role="mentor">
        <div className="mb-8">
          <Link to="/mentor/mentees" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to My Mentees
          </Link>
        </div>
        <Card className="p-12 border-0 shadow-lg text-center">
          <p className="text-gray-500">Loading...</p>
        </Card>
      </DashboardLayout>
    );
  }

  if (!mentee) {
    return (
      <DashboardLayout role="mentor">
        <div className="mb-8">
          <Link to="/mentor/mentees" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to My Mentees
          </Link>
        </div>
        <Card className="p-12 border-0 shadow-lg text-center">
          <p className="text-gray-600">Mentee not found.</p>
          <Link to="/mentor/mentees">
            <Button variant="outline" className="mt-4">
              Back to My Mentees
            </Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  const joinedDate = new Date(mentee.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout role="mentor">
      <div className="mb-8">
        <Link to="/mentor/mentees" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 inline-block">
          ← Back to My Mentees
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentee Profile</h1>
        <p className="text-gray-600">View progress and session history</p>
      </div>

      <div className="max-w-4xl space-y-8">
        <Card className="p-8 border-0 shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarImage src={mentee.avatarUrl ?? DEFAULT_AVATAR} />
              <AvatarFallback>{(mentee.name ?? "M")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{mentee.name ?? "Mentee"}</h2>
              <p className="text-gray-600 mb-3">{mentee.email}</p>
              <Badge variant="secondary" className="mb-4">
                Joined {joinedDate}
              </Badge>
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleScheduleSession}
                >
                  <Calendar size={18} className="mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" onClick={handleSendMessage}>
                  <MessageSquare size={18} className="mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Summary</h2>
          </div>
          <p className="text-gray-600">
            {mentee.sessionsCompleted} session{mentee.sessionsCompleted !== 1 ? "s" : ""} completed with you.
          </p>
        </Card>

        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Session History</h2>
          </div>
          <div className="space-y-4">
            {mentee.sessions.length === 0 ? (
              <p className="text-gray-500">No sessions yet.</p>
            ) : (
              mentee.sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{session.topic}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.scheduledAt).toLocaleDateString("en-US")} · {session.durationMinutes} min
                    </p>
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
