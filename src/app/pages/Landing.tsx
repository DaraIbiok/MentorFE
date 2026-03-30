import { Link } from "react-router";
import { motion } from "motion/react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  ArrowRight, 
  UserPlus, 
  Search, 
  Calendar, 
  Video, 
  Star,
  Users,
  Target,
  TrendingUp,
  Shield,
  Award
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0">
                  🚀 Transform Your Career Journey
                </Badge>
              </motion.div>
              <motion.h1
                className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
                variants={fadeInUp}
              >
                Connect with{" "}
                <span className="text-indigo-600">Expert Mentors</span>{" "}
                to Accelerate Growth
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 leading-relaxed"
                variants={fadeInUp}
              >
                Join thousands of professionals finding guidance, building skills, and achieving their career goals through meaningful mentorship.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeInUp}>
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-gray-300 h-12 px-8"
                  >
                    Browse Mentors
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-8 pt-4"
                variants={fadeInUp}
              >
                <div>
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-gray-500 text-sm">Active Users</p>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">500+</p>
                  <p className="text-gray-500 text-sm">Expert Mentors</p>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">95%</p>
                  <p className="text-gray-500 text-sm">Success Rate</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Hero Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 to-emerald-50 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop" 
                  alt="Team collaboration" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Cards */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Star className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.9/5</p>
                  <p className="text-xs text-gray-500">Average Rating</p>
                </div>
              </motion.div>
              <motion.div
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Video className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">50K+</p>
                  <p className="text-xs text-gray-500">Sessions Completed</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How MentorMe Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and connect with your ideal mentor
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              {
                icon: <UserPlus size={32} />,
                title: "Create Your Profile",
                description: "Sign up and tell us about your goals, interests, and what you're looking to achieve.",
                step: "01"
              },
              {
                icon: <Search size={32} />,
                title: "Find Your Mentor",
                description: "Browse through our curated list of expert mentors and find the perfect match for you.",
                step: "02"
              },
              {
                icon: <Calendar size={32} />,
                title: "Start Learning",
                description: "Schedule sessions, have video calls, and track your progress as you grow.",
                step: "03"
              }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="relative p-8 border-0 shadow-lg hover:shadow-xl transition-all group h-full">
                  <motion.div
                    className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {item.step}
                  </motion.div>
                  <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-100 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 mb-4">
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All the tools you need to build meaningful mentorship relationships
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              {
                icon: <Users size={24} />,
                title: "Smart Matching",
                description: "Our AI-powered algorithm connects you with mentors who align with your goals and expertise.",
                color: "indigo"
              },
              {
                icon: <Video size={24} />,
                title: "Video Sessions",
                description: "High-quality video calls with built-in chat and note-taking capabilities.",
                color: "emerald"
              },
              {
                icon: <Target size={24} />,
                title: "Goal Tracking",
                description: "Set goals, track progress, and celebrate milestones together.",
                color: "indigo"
              },
              {
                icon: <TrendingUp size={24} />,
                title: "Progress Analytics",
                description: "Visualize your growth with detailed insights and progress reports.",
                color: "emerald"
              },
              {
                icon: <Shield size={24} />,
                title: "Secure & Private",
                description: "Your data is encrypted and protected with enterprise-grade security.",
                color: "indigo"
              },
              {
                icon: <Award size={24} />,
                title: "Verified Mentors",
                description: "All mentors are thoroughly vetted and verified professionals.",
                color: "emerald"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer h-full">
                    <motion.div
                      className={`
                        w-14 h-14 rounded-xl flex items-center justify-center mb-6
                        ${feature.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}
                      `}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0 mb-4">
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                content: "MentorMe helped me transition from junior to senior engineer in just 8 months. My mentor's guidance was invaluable.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                content: "The quality of mentors on this platform is outstanding. I've learned more in 3 months than I did in 2 years on my own.",
                rating: 5
              },
              {
                name: "Emily Thompson",
                role: "UX Designer",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                content: "Found my dream mentor who helped me land my dream job. The session scheduling and progress tracking are so smooth.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-12 md:p-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are accelerating their careers with expert mentorship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-white hover:bg-gray-100 text-indigo-600 px-8 h-12"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent border-white text-white hover:bg-white/10 h-12 px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-indigo-200 mt-6 text-sm">
                No credit card required • Free forever plan available
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
