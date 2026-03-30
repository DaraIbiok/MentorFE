import { Link } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Star, MapPin, ArrowRight } from "lucide-react";

const featuredMentors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "VP of Engineering at Meta",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 180,
    hourlyRate: 150,
    location: "San Francisco, CA",
    expertise: ["Engineering Leadership", "System Design", "Career Growth"],
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Senior Product Manager at Google",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5.0,
    reviews: 145,
    hourlyRate: 120,
    location: "Mountain View, CA",
    expertise: ["Product Strategy", "Agile", "User Research"],
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Design Director at Airbnb",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 4.8,
    reviews: 220,
    hourlyRate: 140,
    location: "New York, NY",
    expertise: ["UX Design", "Design Systems", "Team Leadership"],
  },
  {
    id: 4,
    name: "Alex Kumar",
    title: "Tech Lead at Amazon",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 165,
    hourlyRate: 130,
    location: "Seattle, WA",
    expertise: ["Software Architecture", "AWS", "Distributed Systems"],
  },
  {
    id: 5,
    name: "Jessica Park",
    title: "Head of Marketing at Stripe",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    rating: 4.7,
    reviews: 130,
    hourlyRate: 110,
    location: "Austin, TX",
    expertise: ["Growth Marketing", "B2B Strategy", "Content"],
  },
  {
    id: 6,
    name: "David Thompson",
    title: "CTO at Fintech Startup",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    rating: 5.0,
    reviews: 95,
    hourlyRate: 160,
    location: "Boston, MA",
    expertise: ["Startup CTO", "Team Building", "Architecture"],
  },
];

export default function BrowseMentorsPublic() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 mb-4">
            Find a Mentor
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet our mentors
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Industry experts ready to help you grow. Sign up to browse all mentors, filter by expertise, and book sessions.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12">
              Sign up to browse all mentors
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMentors.map((mentor) => (
            <Card key={mentor.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className="flex gap-4 mb-4">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{mentor.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{mentor.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="text-amber-500 fill-amber-500" size={14} />
                    <span className="text-sm font-medium text-gray-700">{mentor.rating}</span>
                    <span className="text-sm text-gray-400">({mentor.reviews})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <MapPin size={14} />
                {mentor.location}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.expertise.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                From ${mentor.hourlyRate}/session
              </p>
              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Sign up to connect
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center mt-12">
          <p className="text-gray-600 mb-4">
            Already have an account? Browse the full list and book sessions.
          </p>
          <Link to="/login">
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
              Sign in
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
