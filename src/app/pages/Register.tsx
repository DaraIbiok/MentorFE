import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { ArrowLeft, Eye, EyeOff, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, getAccessToken } from "../../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signUp, isLoading } = useAuth();
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "pending">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    skills: "",
    bio: "",
  });

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      if (user.role === "mentor") {
        // Check verification status
        const vs = (user as any).verificationStatus;
        if (vs === "pending") {
          setStep("pending");
          return;
        }
        navigate("/mentor/dashboard", { replace: true });
      } else if (user.role === "mentee") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { sessionCreated } = await signUp(
        formData.email.trim(),
        formData.password,
        { name: formData.name.trim() || "New User", role }
      );

      if (sessionCreated) {
        if (role === "mentor") {
          toast.success("Account created! Continue to the mentor application.");
          navigate("/mentor/apply", { replace: true });
        } else {
          // Attach additional mentee profile info if provided
          try {
            const base = getApiUrl();
            const token = await getAccessToken();
            await fetch(`${base}/api/profile`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bio: formData.bio || undefined,
                skills: formData.skills
                  ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
                  : undefined,
              }),
            });
          } catch {}

          toast.success("Account created! Welcome to MentorMe!");
          navigate("/dashboard", { replace: true });
        }
      } else if (role === "mentor") {
        // Mentor should continue directly to application even if confirmation flow is not immediate
        toast.success("Account created! Continue to mentor application.");
        navigate("/mentor/apply?step=1", { replace: true });
      } else {
        toast.success("Check your email to confirm your account, then sign in.");
        navigate("/login", { replace: true });
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Sign up failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Pending verification screen
  if (step === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card className="p-10 border-0 shadow-xl text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Under Review</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for applying to become a mentor on MentorMe! Our admin team will review
              your profile and get back to you shortly.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Application submitted successfully</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">Admin review in progress (usually within 24 hours)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-400">You'll be notified once approved</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You'll receive a notification when your application is approved. You can sign in at any time to check your status.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

        <Card className="p-8 border-0 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">MentorMe</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join thousands growing their careers</p>
          </div>

          {/* Role selector */}
          <div className="mb-8">
            <Label className="mb-3 block">I want to join as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("mentee")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === "mentee" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Mentee</div>
                <div className="text-sm text-gray-600">I'm looking for guidance</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === "mentor" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">Mentor</div>
                <div className="text-sm text-gray-600">I want to share my expertise</div>
                {role === "mentor" && (
                  <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                    <Clock size={11} /> Requires admin approval
                  </div>
                )}
              </button>
            </div>

            {/* Mentor notice */}
            {role === "mentor" && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Mentor applications are reviewed.</span> After signing up,
                  your profile will be reviewed by our admin team before you appear in the mentor directory.
                  This usually takes less than 24 hours.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name" type="text" placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11" required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email" type="email" placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 pr-10" required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {role === "mentee" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skills">Areas of Interest <span className="text-xs text-gray-400">(comma-separated)</span></Label>
                  <Input
                    id="skills" type="text"
                    placeholder="Web Development, Leadership, Career Growth"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell Us About Yourself</Label>
                  <Textarea
                    id="bio"
                    placeholder="What are your goals, and what would you like to learn through mentorship?"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={submitting}
            >
              {submitting
                ? role === "mentor"
                  ? "Continuing to application..."
                  : "Creating account..."
                : role === "mentor"
                  ? "Continue to Application →"
                  : "Create Account"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              By signing up, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
            </p>
          </form>

          <p className="text-center text-gray-600 mt-6 pt-6 border-t border-gray-200">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}