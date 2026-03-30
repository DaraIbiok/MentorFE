import { Link } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Target, Heart, Users, Quote, ArrowRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content: "MentorMe helped me transition from junior to senior engineer. My mentor gave me real-world advice I couldn't get anywhere else.",
  },
  {
    name: "James Wilson",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content: "The quality of mentors here is outstanding. I've had three sessions and each one was worth every minute.",
  },
  {
    name: "Priya Patel",
    role: "Design Lead",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    content: "I recommend MentorMe to everyone on my team. It's the best investment in your career you can make.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 mb-4">
            About Us
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            We believe everyone deserves great mentorship
          </h1>
          <p className="text-xl text-gray-600">
            MentorMe connects professionals with expert mentors so they can grow faster, make better decisions, and achieve their goals.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8 border-0 shadow-lg text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Target size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Our mission</h2>
            <p className="text-gray-600 text-sm">
              Make expert mentorship accessible so that talent and hard work—not network—determine success.
            </p>
          </Card>
          <Card className="p-8 border-0 shadow-lg text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <Heart size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What we care about</h2>
            <p className="text-gray-600 text-sm">
              Real relationships, measurable progress, and a platform that respects both mentors and mentees.
            </p>
          </Card>
          <Card className="p-8 border-0 shadow-lg text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Users size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">By the numbers</h2>
            <p className="text-gray-600 text-sm">
              10K+ users, 500+ mentors, 95% satisfaction. We're growing because our community trusts us.
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What people say about us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 border-0 shadow-lg">
                <Quote className="text-indigo-200 mb-4" size={32} />
                <p className="text-gray-700 mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12">
              Join MentorMe
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
