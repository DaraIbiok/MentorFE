import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Save, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile, updateProfile, getApiUrl, getAccessToken, type Profile } from "../../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

function parseList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function formatList(arr: string[]): string {
  return (arr ?? []).join(", ");
}

async function uploadAvatar(file: File): Promise<string> {
  const base = getApiUrl();
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${base}/api/profile/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || "Upload failed");
  }
  const data = await res.json();
  return data.avatarUrl ?? data.avatar_url ?? "";
}

export default function MenteeSettings() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [accountRole, setAccountRole] = useState<"mentee" | "mentor">("mentee");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    gender: "",
    skillsText: "",
    goalsText: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    sessionReminders: true,
    mentorMessages: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setAccountRole(p.role === "mentor" ? "mentor" : "mentee");
        setForm({
          name: p.name ?? "",
          bio: p.bio ?? "",
          gender: p.gender ?? "",
          skillsText: formatList(p.skills ?? []),
          goalsText: formatList(p.goals ?? []),
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    try {
      const newUrl = await uploadAvatar(file);
      setProfile((p) => p ? { ...p, avatarUrl: newUrl } : p);
      setAvatarCacheBust(Date.now());
      await refreshUser();
      setAvatarPreview(null); // clear preview after real URL is loaded
      toast.success("Profile photo updated!");
    } catch (err) {
      setAvatarPreview(null);
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim() || undefined,
        bio: form.bio.trim() || undefined,
        gender: form.gender.trim() || undefined,
        skills: parseList(form.skillsText),
        goals: parseList(form.goalsText),
      });
      setProfile(updated);
      await refreshUser();
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccountType = async () => {
    if (accountRole === (profile?.role === "mentor" ? "mentor" : "mentee")) return;
    setRoleSaving(true);
    try {
      await updateProfile({ role: accountRole });
      await refreshUser();
      toast.success(
        accountRole === "mentor"
          ? "You are now a mentor. Redirecting..."
          : "You are now a mentee. Redirecting..."
      );
      navigate(accountRole === "mentor" ? "/mentor/dashboard" : "/dashboard", { replace: true });
    } catch {
      toast.error("Failed to update account type");
    } finally {
      setRoleSaving(false);
    }
  };

  const layoutRole = (user?.role === "mentor" || user?.role === "admin") ? user.role : "mentee";
  const [avatarCacheBust, setAvatarCacheBust] = useState(Date.now());
  const rawAvatar = avatarPreview ?? profile?.avatarUrl ?? user?.avatarUrl ?? DEFAULT_AVATAR;
  const currentAvatar = rawAvatar && rawAvatar !== DEFAULT_AVATAR && !avatarPreview
    ? rawAvatar + "?t=" + avatarCacheBust
    : rawAvatar;

  return (
    <DashboardLayout role={layoutRole}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <>
                  {/* Avatar upload */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        <img
                          src={currentAvatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                          }}
                        />
                      </div>
                      <button
                        onClick={handleAvatarClick}
                        disabled={avatarUploading}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                        aria-label="Change profile photo"
                      >
                        {avatarUploading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Profile Photo</p>
                      <p className="text-sm text-gray-500">
                        Click the camera icon to upload. JPG, PNG or GIF, max 5 MB.
                      </p>
                      {avatarUploading && (
                        <p className="text-sm text-indigo-600 mt-1">Uploading...</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                        placeholder="e.g. male, female, other, prefer not to say"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">
                        {layoutRole === "mentor" ? "Skills & Expertise" : "Areas of Interest / Skills"} (comma-separated)
                      </Label>
                      <Input
                        id="skills"
                        value={form.skillsText}
                        onChange={(e) => setForm((f) => ({ ...f, skillsText: e.target.value }))}
                        placeholder="Python, Machine Learning, Career Growth"
                      />
                      <p className="text-xs text-gray-500">
                        {layoutRole === "mentor"
                          ? "These skills are shown on your profile and used to match you with mentees."
                          : "Used to find mentors that match your interests."}
                      </p>
                    </div>
                    {layoutRole !== "mentor" && (
                      <div className="space-y-2">
                        <Label htmlFor="goals">Goals (comma-separated)</Label>
                        <Input
                          id="goals"
                          value={form.goalsText}
                          onChange={(e) => setForm((f) => ({ ...f, goalsText: e.target.value }))}
                          placeholder="Get a job in AI, Learn system design, Improve leadership"
                        />
                        <p className="text-xs text-gray-500">
                          Goals are used to recommend the best mentors for you.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                        rows={4}
                        placeholder={
                          layoutRole === "mentor"
                            ? "Describe your experience and what mentees can expect from sessions with you..."
                            : "Tell us about yourself and your goals..."
                        }
                      />
                    </div>

                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <><Loader2 size={18} className="mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save size={18} className="mr-2" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile?.email ?? ""} disabled />
                  <p className="text-xs text-gray-500">Email is managed by your account provider.</p>
                </div>
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Choose whether you use MentorMe as a mentee (finding mentors) or a mentor (offering mentorship).
                  </p>
                  <Select
                    value={accountRole}
                    onValueChange={(v) => setAccountRole(v as "mentee" | "mentor")}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentee">Mentee</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleUpdateAccountType}
                    disabled={
                      roleSaving ||
                      accountRole === (profile?.role === "mentor" ? "mentor" : "mentee")
                    }
                  >
                    {roleSaving ? "Updating..." : "Update account type"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "sessionReminders", label: "Session Reminders", desc: "Get reminded before your sessions" },
                  { key: "mentorMessages", label: "Mentor Messages", desc: "Notifications when mentors message you" },
                  { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of your activity" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((n) => ({ ...n, [key]: checked }))
                      }
                    />
                  </div>
                ))}
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-6">
                  <Save size={18} className="mr-2" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
