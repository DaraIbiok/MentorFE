import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { CheckCircle2, XCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import {
  fetchMentorRequests,
  respondMentorshipRequest,
  type MentorshipRequestItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

function formatRequestDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

export default function MentorshipRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MentorshipRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorRequests()
      .then(setRequests)
      .catch(() => toast.error("Failed to load requests"))
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => r.status === "pending");

  const handleAccept = async (req: MentorshipRequestItem) => {
    try {
      await respondMentorshipRequest(req.id, "accepted");
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "accepted" } : r)));
      toast.success(`Mentorship request from ${req.mentee.name ?? "mentee"} accepted!`);
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (req: MentorshipRequestItem) => {
    try {
      await respondMentorshipRequest(req.id, "declined");
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleViewProfile = (menteeId: string) => {
    navigate(`/mentor/mentees/${menteeId}`);
  };

  return (
    <DashboardLayout role="mentor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Requests</h1>
        <p className="text-gray-600">Review and respond to mentorship requests</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={48} />}
          title="No pending requests"
          subtitle="You're all caught up! New mentorship requests will appear here."
        />
      ) : (
        <div className="space-y-6">
          {pending.map((request) => (
            <Card
              key={request.id}
              className="p-6 border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-64 flex-shrink-0">
                  <div className="flex lg:flex-col items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={request.mentee.avatarUrl ?? DEFAULT_AVATAR} />
                      <AvatarFallback>{(request.mentee.name ?? "M")[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {request.mentee.name ?? "Mentee"}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        <Calendar size={12} className="mr-1" />
                        {formatRequestDate(request.createdAt)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{request.topic}</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">{request.message}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {request.preferredTime && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Preferred Time</p>
                        <p className="text-gray-600">{request.preferredTime}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAccept(request)}
                    >
                      <CheckCircle2 size={18} className="mr-2" />
                      Accept Request
                    </Button>
                    <Button
                      variant="outline"
                      className="text-gray-700"
                      onClick={() => handleViewProfile(request.menteeId)}
                    >
                      View Full Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      onClick={() => handleDecline(request)}
                    >
                      <XCircle size={18} className="mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
