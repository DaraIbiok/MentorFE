import { Link } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { UserPlus, Search, Calendar, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and tell us about your goals, interests, and what you're looking to achieve. It only takes a few minutes.",
  },
  {
    step: "02",
    icon: Search,
    title: "Find Your Mentor",
    description: "Browse through our curated list of expert mentors. Filter by industry, expertise, and availability to find the perfect match.",
  },
  {
    step: "03",
    icon: Calendar,
    title: "Start Learning",
    description: "Schedule sessions, have video calls, and track your progress. Your mentor will guide you every step of the way.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 mb-4">
            Simple Process
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How MentorMe Works
          </h1>
          <p className="text-xl text-gray-600">
            Get started in minutes and connect with your ideal mentor. No long applications—just sign up, browse, and book.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((item, index) => (
            <Card key={index} className="relative p-8 border-0 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <item.icon size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12">
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
