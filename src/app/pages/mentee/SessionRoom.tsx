import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { RatingDialog } from "../../components/RatingDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  FileText,
  Send,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import {
  fetchSession,
  sendSessionMessage,
  ensureSessionRoom,
  type SessionDetail,
  type SessionMessagePayload,
} from "../../../lib/api";

const REALTIME_CHANNEL_PREFIX = "session:";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
};

function toChatMessage(m: SessionMessagePayload | { id: string; senderId: string; senderName: string | null; text: string; createdAt: string }, currentUserId: string): ChatMessage {
  const d = "createdAt" in m ? new Date(m.createdAt) : new Date();
  return {
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName ?? "Unknown",
    text: m.text,
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    isMe: m.senderId === currentUserId,
  };
}

export default function SessionRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState("");
  const [endCallOpen, setEndCallOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const userId = currentUser?.id ?? "";

  // Fetch session and messages
  useEffect(() => {
    if (!id || !currentUser) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSession(id)
      .then((data) => {
        if (cancelled) return;
        setSession(data);
        setMessages(
          data.messages.map((m) =>
            toChatMessage(
              {
                id: m.id,
                senderId: m.senderId,
                senderName: m.sender.name,
                text: m.text,
                createdAt: m.createdAt,
              },
              userId
            )
          )
        );
        if (data.videoRoomUrl) setVideoUrl(data.videoRoomUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load session");
          toast.error("Session not found");
          navigate("/sessions", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, currentUser, userId, navigate]);

  // Ensure video room on join (creates Daily room if missing)
  useEffect(() => {
    if (!id || !session || !currentUser || videoUrl) return;
    ensureSessionRoom(id)
      .then(({ url }) => setVideoUrl(url))
      .catch(() => {});
  }, [id, session, currentUser, videoUrl]);

  // Supabase Realtime: subscribe to session channel for new messages
  useEffect(() => {
    if (!id || !supabase || !userId) return;
    const channel = supabase.channel(REALTIME_CHANNEL_PREFIX + id);
    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const p = payload as SessionMessagePayload;
        if (p.senderId === userId) return; // we already added from POST response
        setMessages((prev) => [
          ...prev,
          toChatMessage(
            {
              id: p.id,
              senderId: p.senderId,
              senderName: p.senderName ?? null,
              text: p.text,
              createdAt: p.createdAt,
            },
            userId
          ),
        ]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text || !id || !currentUser || sending) return;
    setSending(true);
    try {
      const created = await sendSessionMessage(id, text);
      const chatMsg = toChatMessage(
        {
          id: created.id,
          senderId: created.senderId,
          senderName: created.senderName,
          text: created.text,
          createdAt: created.createdAt,
        },
        userId
      );
      setMessages((prev) => [...prev, chatMsg]);
      setMessage("");

      // Broadcast so other participant sees the message
      if (supabase) {
        const ch = supabase.channel(REALTIME_CHANNEL_PREFIX + id);
        ch.send({
          type: "broadcast",
          event: "message",
          payload: {
            id: created.id,
            senderId: created.senderId,
            senderName: created.senderName,
            text: created.text,
            createdAt: created.createdAt,
          },
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }, [id, message, currentUser, userId, sending]);

  const handleEndSession = () => {
    setEndCallOpen(false);
    setSessionEnded(true);
    setShowRating(true);
  };

  const handleRatingClose = () => {
    setShowRating(false);
    navigate("/sessions");
  };

  if (loading || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {loading && <div className="text-gray-500">Loading session...</div>}
      </div>
    );
  }

  if (!session) return null;

  const mentor = session.mentor;
  const mentee = session.mentee;
  const mentorName = mentor.name ?? "Mentor";
  const mentorAvatar = mentor.avatarUrl ?? DEFAULT_AVATAR;
  const scheduledAt = new Date(session.scheduledAt);
  const timeStr = scheduledAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const durationStr = `${session.durationMinutes} min`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/sessions"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
            >
              ← Back
            </Link>
            <Avatar className="h-10 w-10">
              <AvatarImage src={mentorAvatar} />
              <AvatarFallback>{mentorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">Session with {mentorName}</p>
              <p className="text-sm text-gray-600">{session.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {timeStr} · {durationStr}
            </span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-6">
            {videoUrl ? (
              <Card className="relative aspect-video bg-gray-900 overflow-hidden border-0 shadow-2xl">
                <iframe
                  title="Video call"
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="camera; microphone; fullscreen; display-capture"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                  <p className="text-white text-sm font-medium">{mentorName}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white"
                >
                  <Maximize2 size={20} />
                </Button>
              </Card>
            ) : (
              <Card className="relative aspect-video bg-gray-900 overflow-hidden border-0 shadow-2xl">
                <img
                  src={mentorAvatar.replace("w=100&h=100", "w=800&h=600")}
                  alt="Mentor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                  <p className="text-white text-sm font-medium">{mentorName}</p>
                </div>
                <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
                  Video room is being set up...
                </p>
              </Card>
            )}

            {/* Your Video (placeholder or future PiP) */}
            <Card className="relative w-64 aspect-video bg-gray-800 overflow-hidden border-0 shadow-xl">
              <img
                src={currentUser ? (mentee.id === userId ? DEFAULT_AVATAR : mentorAvatar) : DEFAULT_AVATAR}
                alt="You"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
                <p className="text-white text-xs font-medium">You</p>
              </div>
            </Card>

            {/* Controls */}
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "outline"}
                  className="h-14 w-14 rounded-full"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "outline"}
                  className="h-14 w-14 rounded-full"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </Button>
                <AlertDialog open={endCallOpen} onOpenChange={setEndCallOpen}>
                  <Button
                    size="lg"
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setEndCallOpen(true)}
                    aria-label="End session"
                  >
                    <Phone size={24} />
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>End session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to end the session?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEndSession}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        End Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg h-[calc(100vh-200px)] flex flex-col">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    activeTab === "chat"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare size={18} className="inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    activeTab === "notes"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText size={18} className="inline mr-2" />
                  Notes
                </button>
              </div>

              {activeTab === "chat" && (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.isMe ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {!msg.isMe && (
                              <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                            )}
                            <p className="text-sm">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.isMe ? "text-indigo-200" : "text-gray-500"
                              }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sending}
                      />
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleSendMessage}
                        disabled={sending || !message.trim()}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notes" && (
                <div className="flex-1 p-4">
                  <Textarea
                    placeholder="Take notes during your session..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-full resize-none"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      <RatingDialog 
        isOpen={showRating} 
        sessionId={id || ""} 
        mentorName={session?.mentor?.name || "Mentor"} 
        onClose={handleRatingClose} 
      />
    </div>
  );
}
