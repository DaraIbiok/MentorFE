import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, BookOpen, FileText, Video, Book, Wrench, Heart, ExternalLink } from "lucide-react";

type ResourceType = "article" | "video" | "book" | "tool";

type Resource = {
  id: number;
  type: ResourceType;
  title: string;
  description: string;
  tags: string[];
  readTimeOrDuration: string;
  url: string;
};

const resources: Resource[] = [
  {
    id: 1,
    type: "article",
    title: "The Manager's Path: A Guide for Tech Leaders",
    description: "A practical guide for engineers and engineering managers on building and leading effective teams in tech.",
    tags: ["Leadership", "Career", "Management"],
    readTimeOrDuration: "12 min read",
    url: "#",
  },
  {
    id: 2,
    type: "video",
    title: "System Design Interview Masterclass",
    description: "Learn how to approach system design interviews with real-world examples from FAANG engineers.",
    tags: ["Technical", "System Design", "Interview"],
    readTimeOrDuration: "2h 15m",
    url: "#",
  },
  {
    id: 3,
    type: "book",
    title: "Crucial Conversations",
    description: "Tools for talking when stakes are high. Master dialogue for difficult conversations at work and home.",
    tags: ["Communication", "Leadership", "Soft Skills"],
    readTimeOrDuration: "6h read",
    url: "#",
  },
  {
    id: 4,
    type: "tool",
    title: "Notion Career Tracker Template",
    description: "A free template to track goals, skills, and progress. Perfect for mentees building a career roadmap.",
    tags: ["Career", "Productivity", "Goals"],
    readTimeOrDuration: "Template",
    url: "#",
  },
  {
    id: 5,
    type: "article",
    title: "How to Get Promoted as an Engineer",
    description: "Actionable steps and visibility strategies that help engineers advance to senior and staff levels.",
    tags: ["Career", "Engineering", "Growth"],
    readTimeOrDuration: "8 min read",
    url: "#",
  },
  {
    id: 6,
    type: "video",
    title: "Python for Data Science in 60 Minutes",
    description: "A fast-paced intro to Python, pandas, and visualization for aspiring data scientists.",
    tags: ["Python", "Data Science", "Technical"],
    readTimeOrDuration: "1h",
    url: "#",
  },
  {
    id: 7,
    type: "book",
    title: "The Lean Startup",
    description: "Eric Ries's framework for building and scaling startups through validated learning and iteration.",
    tags: ["Entrepreneurship", "Startups", "Product"],
    readTimeOrDuration: "8h read",
    url: "#",
  },
  {
    id: 8,
    type: "article",
    title: "Giving and Receiving Feedback That Works",
    description: "How to deliver constructive feedback and receive criticism without defensiveness.",
    tags: ["Communication", "Leadership", "Feedback"],
    readTimeOrDuration: "6 min read",
    url: "#",
  },
  {
    id: 9,
    type: "tool",
    title: "LeetCode Study Plan Generator",
    description: "Generate a personalized study plan for technical interview prep based on your timeline.",
    tags: ["Interview", "Technical", "Algorithms"],
    readTimeOrDuration: "Tool",
    url: "#",
  },
  {
    id: 10,
    type: "video",
    title: "Public Speaking for Introverts",
    description: "Techniques to present confidently and communicate ideas clearly, even if you're shy.",
    tags: ["Communication", "Public Speaking", "Soft Skills"],
    readTimeOrDuration: "45m",
    url: "#",
  },
  {
    id: 11,
    type: "article",
    title: "Building Your Personal Brand as a Developer",
    description: "Why and how to build an online presence through writing, open source, and social proof.",
    tags: ["Career", "Personal Brand", "Marketing"],
    readTimeOrDuration: "10 min read",
    url: "#",
  },
  {
    id: 12,
    type: "book",
    title: "The First 90 Days",
    description: "Proven strategies for succeeding in a new role, whether you're joining a company or a new team.",
    tags: ["Leadership", "Career", "Onboarding"],
    readTimeOrDuration: "5h read",
    url: "#",
  },
];

const typeConfig: Record<ResourceType, { label: string; icon: typeof FileText; bg: string; text: string }> = {
  article: { label: "Article", icon: FileText, bg: "bg-indigo-100", text: "text-indigo-600" },
  video: { label: "Video", icon: Video, bg: "bg-emerald-100", text: "text-emerald-600" },
  book: { label: "Book", icon: Book, bg: "bg-purple-100", text: "text-purple-600" },
  tool: { label: "Tool", icon: Wrench, bg: "bg-orange-100", text: "text-orange-600" },
};

const TAB_ALL = "all";
type TabValue = typeof TAB_ALL | ResourceType;

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>(TAB_ALL);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const filteredResources = resources.filter((r) => {
    const matchTab = activeTab === TAB_ALL || r.type === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  const toggleSaved = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout role="mentee">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
        <p className="text-gray-600">Curated content to accelerate your growth</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search by title or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {([TAB_ALL, "article", "video", "book", "tool"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab === TAB_ALL ? "All" : typeConfig[tab].label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((r) => {
          const config = typeConfig[r.type];
          const Icon = config.icon;
          const isSaved = savedIds.has(r.id);
          return (
            <Card key={r.id} className="border-0 shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              {/* Thumbnail placeholder */}
              <div
                className={`aspect-video flex items-center justify-center ${config.bg} ${config.text}`}
              >
                <Icon size={48} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`${config.bg} ${config.text} border-0`}>
                    {config.label}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => toggleSaved(r.id)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                    aria-label={isSaved ? "Remove from saved" : "Save resource"}
                  >
                    <Heart
                      size={18}
                      className={isSaved ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{r.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{r.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-4">{r.readTimeOrDuration}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink size={14} className="mr-2" />
                    Open Resource
                  </Button>
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No resources match your filters.</p>
          <p className="text-sm mt-1">Try a different search or tab.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
