import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Clock, CheckCircle, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import { DashboardLayout } from "../components/layout/DashboardLayout";

export default function MentorPending() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card className="p-10 border-0 shadow-xl text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Application Under Review
          </h1>
          <p className="text-gray-600 mb-2">
            Hi <span className="font-semibold">{user?.name}</span>,
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your mentor application is currently being reviewed by our admin team.
            You'll receive a notification once it's approved.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Application submitted successfully</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Admin review in progress (usually within 24 hours)</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">You'll be notified at <strong>{user?.email}</strong> when approved</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => { await logout(); }}
            >
              Sign Out
            </Button>
            <Link to="/" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}