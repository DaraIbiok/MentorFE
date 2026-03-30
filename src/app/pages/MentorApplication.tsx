import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, getAccessToken } from "../../lib/api";
import {
  CheckCircle, User, Briefcase, FileText,
  ChevronRight, ChevronLeft, Upload, Loader2, Clock, AlertCircle
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Professional", icon: Briefcase },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Review", icon: CheckCircle },
];

type FormData = {
  phoneNumber: string;
  location: string;
  gender: string;
  jobTitle: string;
  company: string;
  yearsExperience: string;
  linkedinUrl: string;
  skills: string[];
  professionalBio: string;
  idDocument: File | null;
  idDocumentType: string;
  certificate: File | null;
};

type ApplicationStatus = {
  id: string | null;
  mentorId: string;
  status: string;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  submittedAt: string | null;
  createdAt: string | null;
  phoneNumber?: string;
  location?: string;
  gender?: string;
  jobTitle?: string;
  company?: string;
  yearsExperience?: number;
  linkedinUrl?: string;
  skills?: string[];
  professionalBio?: string;
  idDocumentUrl?: string;
  idDocumentType?: string;
  professionalCertificateUrl?: string;
};

async function uploadDoc(file: File, subfolder: string): Promise<string> {
  const base = getApiUrl();
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${base}/api/profile/upload-doc?subfolder=${subfolder}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

export default function MentorApplication() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: "",
    location: "",
    gender: "",
    jobTitle: "",
    company: "",
    yearsExperience: "",
    linkedinUrl: "",
    skills: [],
    professionalBio: "",
    idDocument: null,
    idDocumentType: "passport",
    certificate: null,
  });

  // If not authenticated, show registration prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <Card className="p-10 border-0 shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mb-2">MentorMe</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Become a Mentor</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            To apply as a mentor, you need to create an account first. This will take just a minute!
          </p>
          <div className="space-y-4">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => navigate("/register")}
            >
              Create Mentor Account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Sign In to Continue Application
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Already have an account? Sign in to continue your application.
          </p>
        </Card>
      </div>
    );
  }

  // Check if user is a mentor
  if (user && user.role !== "mentor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <Card className="p-10 border-0 shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Mentor Application</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This application is for mentors only. If you'd like to become a mentor, please contact support.
          </p>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => navigate("/")}
          >
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  // Load application status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const base = getApiUrl();
        const token = await getAccessToken();
        const res = await fetch(`${base}/api/mentor/application`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        setAppStatus(data);
        
        // If application is already submitted, show submitted screen
        if (data.status === "submitted" || data.status === "approved") {
          setSubmitted(true);
          return;
        }
        
        // Check if user is already approved
        if (user?.verificationStatus === "approved") {
          navigate("/mentor/dashboard", { replace: true });
          return;
        }
        
        // If no application exists (status is "not_started" or no id), start at step 1
        if (!data.id || data.status === "not_started") {
          setStep(1);
          return;
        }
        
        // Load existing data into form if available
        if (data.phoneNumber) setFormData(f => ({ ...f, phoneNumber: data.phoneNumber || "" }));
        if (data.location) setFormData(f => ({ ...f, location: data.location || "" }));
        if (data.gender) setFormData(f => ({ ...f, gender: data.gender || "" }));
        if (data.jobTitle) setFormData(f => ({ ...f, jobTitle: data.jobTitle || "" }));
        if (data.company) setFormData(f => ({ ...f, company: data.company || "" }));
        if (data.yearsExperience) setFormData(f => ({ ...f, yearsExperience: String(data.yearsExperience) }));
        if (data.linkedinUrl) setFormData(f => ({ ...f, linkedinUrl: data.linkedinUrl || "" }));
        if (data.skills) setFormData(f => ({ ...f, skills: data.skills || [] }));
        if (data.professionalBio) setFormData(f => ({ ...f, professionalBio: data.professionalBio || "" }));
        
        // Respect explicit step=1 from registration flow
const forcedStep = searchParams.get("step");
if (forcedStep === "1") {
  setStep(1);
  return;
}

// Otherwise continue auto-resume logic
if (data.step3Completed) setStep(4);
else if (data.step2Completed) setStep(3);
else if (data.step1Completed) setStep(2);
      } catch (err) {
        console.error("Failed to load status:", err);
        // Default to step 1 on error
        setStep(1);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [user, searchParams]);

  const update = (field: keyof FormData, value: any) =>
    setFormData((f) => ({ ...f, [field]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!formData.phoneNumber.trim()) {
        toast.error("Phone number is required");
        return false;
      }
      if (!formData.location.trim()) {
        toast.error("Location is required");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.jobTitle.trim()) {
        toast.error("Job title is required");
        return false;
      }
      if (!formData.yearsExperience) {
        toast.error("Years of experience is required");
        return false;
      }
      if (formData.skills.length === 0) {
        toast.error("At least one skill is required");
        return false;
      }
      if (formData.professionalBio.length < 50) {
        toast.error("Professional bio must be at least 50 characters");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!formData.idDocument) {
        toast.error("ID document is required");
        return false;
      }
      if (!formData.certificate) {
        toast.error("Professional certificate is required");
        return false;
      }
      return true;
    }
    return true;
  };

  const submitStep = async (nextStep: Step) => {
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const base = getApiUrl();
      const token = await getAccessToken();

      if (step === 1) {
        const res = await fetch(`${base}/api/mentor/apply/step1`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            location: formData.location,
            gender: formData.gender,
          }),
        });
        if (!res.ok) throw new Error("Failed to submit Step 1");
        const data = await res.json();
        setAppStatus(data);
        toast.success("Personal information saved!");
        setStep(nextStep);
      } else if (step === 2) {
        const res = await fetch(`${base}/api/mentor/apply/step2`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobTitle: formData.jobTitle,
            company: formData.company,
            yearsExperience: parseInt(formData.yearsExperience),
            linkedinUrl: formData.linkedinUrl,
            skills: formData.skills,
            professionalBio: formData.professionalBio,
          }),
        });
        if (!res.ok) throw new Error("Failed to submit Step 2");
        const data = await res.json();
        setAppStatus(data);
        toast.success("Professional information saved!");
        setStep(nextStep);
      } else if (step === 3) {
        let idUrl = "";
        let certUrl = "";
        if (formData.idDocument) {
          toast.loading("Uploading ID document...");
          idUrl = await uploadDoc(formData.idDocument, "verification");
        }
        if (formData.certificate) {
          toast.loading("Uploading certificate...");
          certUrl = await uploadDoc(formData.certificate, "verification");
        }

        const res = await fetch(`${base}/api/mentor/apply/step3`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idDocumentUrl: idUrl,
            idDocumentType: formData.idDocumentType,
            professionalCertificateUrl: certUrl,
          }),
        });
        if (!res.ok) throw new Error("Failed to submit Step 3");
        const data = await res.json();
        setAppStatus(data);
        toast.success("Documents saved!");
        setStep(nextStep);
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const base = getApiUrl();
      const token = await getAccessToken();

      const res = await fetch(`${base}/api/mentor/apply/step4`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to submit application");

      await refreshUser();
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <Card className="p-10 border-0 shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you! Our admin team will review your documents and get back to you within 24-48 hours.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm text-gray-700">Personal information verified</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm text-gray-700">Professional background saved</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm text-gray-700">Documents uploaded and verified</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-amber-500" />
              <span className="text-sm text-gray-700">Awaiting admin review</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            You'll receive an email once our team has reviewed your application. In the meantime, you can check your application status anytime.
          </p>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => navigate("/mentor/pending")}
          >
            View Application Status
          </Button>
        </Card>
      </div>
    );
  }

  const canProceed = (): boolean => {
    if (step === 1) {
      return formData.phoneNumber.trim() !== "" && formData.location.trim() !== "";
    }
    if (step === 2) {
      return (
        formData.jobTitle.trim() !== "" &&
        formData.yearsExperience !== "" &&
        formData.skills.length > 0 &&
        formData.professionalBio.length >= 50
      );
    }
    if (step === 3) {
      return formData.idDocument !== null && formData.certificate !== null;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MentorMe</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Application</h1>
          <p className="text-gray-600">Hi {user?.name}! Complete your application to become a mentor.</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-10 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step > s.id
                      ? "bg-emerald-500 text-white"
                      : step === s.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.id ? <CheckCircle size={20} /> : <s.icon size={18} />}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    step === s.id ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${
                    step > s.id ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8 border-0 shadow-xl">
          {/* Step 1 — Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
                <p className="text-gray-500 text-sm">Basic details about you</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="+234 800 000 0000"
                    value={formData.phoneNumber}
                    onChange={(e) => update("phoneNumber", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Lagos, Nigeria"
                    value={formData.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender (optional)</Label>
                <select
                  value={formData.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Professional Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Professional Background</h2>
                <p className="text-gray-500 text-sm">Tell us about your experience</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Current Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => update("jobTitle", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company / Organization</Label>
                  <Input
                    placeholder="Google, Freelance, etc."
                    value={formData.company}
                    onChange={(e) => update("company", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Years of Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={formData.yearsExperience}
                    onChange={(e) => update("yearsExperience", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn Profile (optional)</Label>
                  <Input
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.linkedinUrl}
                    onChange={(e) => update("linkedinUrl", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Skills & Expertise <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-1">(separate with commas)</span>
                </Label>
                <Input
                  placeholder="Python, Machine Learning, Career Coaching, Leadership"
                  value={formData.skills.join(", ")}
                  onChange={(e) =>
                    update(
                      "skills",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  {formData.skills.length} skill{formData.skills.length !== 1 ? "s" : ""} added
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Professional Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Describe your professional background, achievements, and how you can help mentees. Be specific about what areas you can mentor in..."
                  value={formData.professionalBio}
                  onChange={(e) => update("professionalBio", e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-400">
                  {formData.professionalBio.length}/500 characters{" "}
                  {formData.professionalBio.length < 50 && (
                    <span className="text-red-500 ml-1">
                      (minimum 50 characters required)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 3 — Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Document Upload</h2>
                <p className="text-gray-500 text-sm">
                  Documents are reviewed by our admin team to verify your identity and expertise. They are kept secure and confidential.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Government Issued ID <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-1">
                    (NIN slip, passport, or driver's license)
                  </span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    formData.idDocument
                      ? "border-emerald-400 bg-emerald-50"
                      : " border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                  onClick={() => document.getElementById("id-upload")?.click()}
                >
                  {formData.idDocument ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle size={20} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">
                        {formData.idDocument.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload ID document</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5MB</p>
                    </>
                  )}
                  <input
                    id="id-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => update("idDocument", e.target.files?.[0] ?? null)}
                  />
                </div>

                {formData.idDocument && (
                  <div className="space-y-2">
                    <Label>ID Document Type *</Label>
                    <select
                      value={formData.idDocumentType}
                      onChange={(e) => update("idDocumentType", e.target.value)}
                      className="w-full h-11 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="passport">Passport</option>
                      <option value="nin">NIN (National ID)</option>
                      <option value="driver_license">Driver's License</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Professional Certificate or Degree <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-1">(proof of expertise)</span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    formData.certificate
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                  onClick={() => document.getElementById("cert-upload")?.click()}
                >
                  {formData.certificate ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle size={20} className="text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">
                        {formData.certificate.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload certificate</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5MB</p>
                    </>
                  )}
                  <input
                    id="cert-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => update("certificate", e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 flex gap-3">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  🔒 Your documents are encrypted and only accessible to our admin team for verification purposes.
                </span>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Application</h2>
                <p className="text-gray-500 text-sm">
                  Please confirm everything looks correct before submitting.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Personal
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{user?.email}</span>
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{formData.phoneNumber}</span>
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{formData.location}</span>
                    {formData.gender && (
                      <>
                        <span className="text-gray-500">Gender</span>
                        <span className="font-medium">{formData.gender}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Professional
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Title</span>
                    <span className="font-medium">{formData.jobTitle}</span>
                    <span className="text-gray-500">Company</span>
                    <span className="font-medium">{formData.company || "—"}</span>
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">{formData.yearsExperience} years</span>
                    <span className="text-gray-500">Skills</span>
                    <span className="font-medium">{formData.skills.join(", ")}</span>
                    {formData.linkedinUrl && (
                      <>
                        <span className="text-gray-500">LinkedIn</span>
                        <a
                          href={formData.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          View Profile →
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Bio
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{formData.professionalBio}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Documents
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>
                        {formData.idDocument?.name}{" "}
                        <span className="text-gray-500">
                          ({formData.idDocumentType.toUpperCase()})
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>{formData.certificate?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl text-sm text-emerald-800 flex gap-3">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  All information looks good! Click "Submit Application" to proceed. Our admin team will review your submission within 24-48 hours.
                </span>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
              disabled={step === 1 || submitting}
            >
              <ChevronLeft size={18} className="mr-1" /> Back
            </Button>

            {step < 4 ? (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => submitStep((step + 1) as Step)}
                disabled={!canProceed() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Continue <ChevronRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}