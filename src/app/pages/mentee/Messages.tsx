import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";

type Message = {
  id: number;
  text: string;
  time: string;
  isMe: boolean;
};

type Conversation = {
  id: number;
  mentorName: string;
  mentorImage: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    mentorName: "Dr. Sarah Johnson",
    mentorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    lastMessage: "Looking forward to our session tomorrow!",
    lastTime: "2:15 PM",
    unread: 2,
    messages: [
      { id: 1, text: "Hi! I'd like to schedule a session to discuss career growth.", time: "10:00 AM", isMe: true },
      { id: 2, text: "Hi! I'd be happy to help. I have slots available this week.", time: "10:05 AM", isMe: false },
      { id: 3, text: "How about Thursday at 2 PM?", time: "10:10 AM", isMe: true },
      { id: 4, text: "Looking forward to our session tomorrow!", time: "2:15 PM", isMe: false },
    ],
  },
  {
    id: 2,
    mentorName: "Michael Chen",
    mentorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    lastMessage: "Great question. We can dive deeper in the next session.",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, text: "Thanks for the interview prep tips last time.", time: "9:00 AM", isMe: true },
      { id: 2, text: "You're welcome! How did the mock interview go?", time: "9:30 AM", isMe: false },
      { id: 3, text: "It went well. I have a follow-up on system design.", time: "10:00 AM", isMe: true },
      { id: 4, text: "Great question. We can dive deeper in the next session.", time: "Yesterday", isMe: false },
    ],
  },
  {
    id: 3,
    mentorName: "Emily Rodriguez",
    mentorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    lastMessage: "Here are the design resources I mentioned.",
    lastTime: "Mon",
    unread: 1,
    messages: [
      { id: 1, text: "Could you share the portfolio feedback doc?", time: "Mon 11:00 AM", isMe: true },
      { id: 2, text: "Here are the design resources I mentioned.", time: "Mon", isMe: false },
    ],
  },
  {
    id: 4,
    mentorName: "Alex Kumar",
    mentorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    lastMessage: "Let me know when you're free for a system design review.",
    lastTime: "Last week",
    unread: 0,
    messages: [
      { id: 1, text: "Hi Alex, I'd love to do a system design deep dive.", time: "Last week", isMe: true },
      { id: 2, text: "Let me know when you're free for a system design review.", time: "Last week", isMe: false },
    ],
  },
];

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<number | null>(initialConversations[0]?.id ?? null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    const newMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      isMe: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: newMessage.text,
              lastTime: newMessage.time,
              unread: 0,
              messages: [...c.messages, newMessage],
            }
          : c
      )
    );
    setInputText("");
  };

  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  return (
    <DashboardLayout role="mentee">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Chat with your mentors. In-session chat is available in each session room after you join.</p>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
        <div className="flex flex-1 min-h-0">
          {/* Left: Conversation list */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<MessageSquare size={48} />}
                    title="No conversations yet"
                    subtitle="Browse mentors to get started and send your first message."
                    actionLabel="Browse Mentors"
                    onAction={() => window.location.href = "/mentors"}
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedId === conv.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conv.mentorImage} />
                      <AvatarFallback>{conv.mentorName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {conv.mentorName}
                        </span>
                        {conv.unread > 0 && (
                          <Badge className="bg-indigo-600 text-white border-0 flex-shrink-0">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">{conv.lastTime}</p>
                    </div>
                  </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Active conversation */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
            {selected ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selected.mentorImage} />
                    <AvatarFallback>{selected.mentorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{selected.mentorName}</p>
                    <p className="text-xs text-gray-500">Mentor</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selected.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.isMe
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                          }`}
                        >
                          {!msg.isMe && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {selected.mentorName}
                            </p>
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
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a mentor from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
