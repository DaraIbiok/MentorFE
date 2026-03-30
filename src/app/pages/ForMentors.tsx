import { Link } from "react-router";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, DollarSign, Award, Clock, ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Reach motivated mentees",
    description: "Connect with professionals who are committed to growth and ready to learn.",
  },
  {
    icon: DollarSign,
    title: "Set your own rates",
    description: "You decide your session price and availability. Get paid for sharing your expertise.",
  },
  {
    icon: Award,
    title: "Build your reputation",
    description: "Earn reviews and showcase your impact. Stand out as a trusted expert.",
  },
  {
    icon: Clock,
    title: "Flexible schedule",
    description: "Choose when you're available. No minimum hours—mentor on your terms.",
  },
];

const requirements = [
  "Professional experience in your field",
  "Clear expertise area (e.g. engineering, product, design)",
  "Willingness to support others",
  "Reliable internet for video sessions",
];

export default function ForMentors() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 mb-4">
            For Mentors
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Become a Mentor
          </h1>
          <p className="text-xl text-gray-600">
            Share your experience, grow your influence, and get paid. Join thousands of experts helping the next generation.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
          {benefits.map((item, index) => (
            <Card key={index} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <item.icon size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">What we look for</h2>
          <ul className="space-y-3">
            {requirements.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="text-emerald-600 shrink-0" size={22} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <Link to="/mentor/apply">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12">
              Apply to Become a Mentor
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
