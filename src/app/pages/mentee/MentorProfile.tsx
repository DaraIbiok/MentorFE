import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Star,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchMentor,
  fetchMentorRatings,
  createMentorshipRequest,
  type MentorDetail,
  type MentorRatingItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [ratings, setRatings] = useState<MentorRatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([fetchMentor(id), fetchMentorRatings(id)])
      .then(([m, r]) => {
        setMentor(m);
        setRatings(r);
      })
      .catch(() => {
        toast.error("Failed to load mentor");
        setMentor(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestMentorship = async () => {
    if (!mentor || !requestTopic.trim() || !requestMessage.trim()) {
      toast.error("Please enter a topic and message");
      return;
    }
    setRequestSubmitting(true);
    try {
      await createMentorshipRequest({
        mentorId: mentor.id,
        topic: requestTopic.trim(),
        message: requestMessage.trim(),
      });
      toast.success("Mentorship request sent! The mentor will respond soon.");
      setRequestOpen(false);
      setRequestTopic("");
      setRequestMessage("");
    } catch {
      toast.error("Failed to send request");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    toast.info("You can message your mentor in the session room after booking a session.");
  };

  if (loading) {
    return (
      <DashboardLayout role="mentee">
        <div className="max-w-5xl mx-auto py-12">
          <p className="text-gray-500">Loading mentor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!mentor) {
    return (
      <DashboardLayout role="mentee">
        <div className="max-w-5xl mx-auto">
          <Card className="p-12 border-0 shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Mentor not found</h2>
            <p className="text-gray-600 mb-6">The mentor you're looking for doesn't exist or may have been removed.</p>
            <Link to="/mentors">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to Browse Mentors
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const ratingAvg = mentor.averageRating ?? 0;
  const ratingCount = mentor.ratingCount ?? 0;

  return (
    <DashboardLayout role="mentee">
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 border-0 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="h-32 w-32 flex-shrink-0">
              <AvatarImage src={mentor.avatarUrl ?? DEFAULT_AVATAR} />
              <AvatarFallback>{(mentor.name ?? "M")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentor.name ?? "Mentor"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  {ratingCount > 0 ? ratingAvg.toFixed(1) : "—"} ({ratingCount} reviews)
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => setRequestOpen(true)}
                >
                  <Calendar size={18} className="mr-2" />
                  Request Mentorship
                </Button>
                <Button size="lg" variant="outline" onClick={handleSendMessage}>
                  <MessageSquare size={18} className="mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({ratingCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mentor.bio ?? "No bio yet."}
              </p>
            </Card>
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {(mentor.skills ?? []).map((skill, i) => (
                  <Badge key={i} className="bg-indigo-50 text-indigo-600 border-0 px-4 py-2">
                    {skill}
                  </Badge>
                ))}
                {(mentor.skills ?? []).length === 0 && (
                  <p className="text-gray-500">No expertise listed yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {ratingCount > 0 ? ratingAvg.toFixed(1) : "—"}
                  </div>
                  <div className="flex mb-2 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.floor(ratingAvg)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">{ratingCount} reviews</div>
                </div>
              </div>
            </Card>
            <div className="space-y-4">
              {ratings.length === 0 ? (
                <Card className="p-6 border-0 shadow-lg">
                  <p className="text-gray-500">No reviews yet.</p>
                </Card>
              ) : (
                ratings.map((r) => (
                  <Card key={r.id} className="p-6 border-0 shadow-lg">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{(r.rater.name ?? "?")[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{r.rater.name ?? "Anonymous"}</p>
                          <span className="text-sm text-gray-500">{formatDate(r.createdAt)} · {r.session.topic}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        {r.comment && (
                          <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Career growth, Interview prep"
                value={requestTopic}
                onChange={(e) => setRequestTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and what you'd like to work on..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleRequestMentorship}
              disabled={requestSubmitting || !requestTopic.trim() || !requestMessage.trim()}
            >
              {requestSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
