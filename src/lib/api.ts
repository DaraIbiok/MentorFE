import { supabase } from "./supabase";

/**
 * Backend API base URL. Set VITE_API_URL in .env (e.g. http://localhost:4000).
 */
export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn("VITE_API_URL not set. API calls will fail.");
    return "";
  }
  return url.replace(/\/$/, "");
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "mentee" | "mentor" | "admin";
  avatarUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
  skills?: string[];
  goals?: string[];
  verificationStatus?: string | null;
  isActive?: boolean;
};

/** Get current Supabase access token for authenticated API calls. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<Response> {
  const base = getApiUrl();
  if (!base) throw new Error("API URL not configured");
  const { skipAuth, ...rest } = options;
  const headers = new Headers(rest.headers);
  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${base}${path}`, { ...rest, headers, credentials: "include" });
}

async function apiJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await authFetch(path, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
  return body as T;
}

/**
 * Fetches the current user from our backend using the Supabase access token.
 */
export async function fetchMe(accessToken: string): Promise<AuthUser> {
  const base = getApiUrl();
  if (!base) throw new Error("API URL not configured");
  const res = await fetch(`${base}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
  }
  const data = (await res.json()) as AuthUser & { avatarUrl?: string; bio?: string; gender?: string; skills?: string[]; goals?: string[] };
  if (!data?.id || !data?.email || !data?.role) throw new Error("Invalid user response");
  return {
    id: data.id,
    name: data.name ?? "",
    email: data.email,
    role: data.role,
    avatarUrl: data.avatarUrl ?? null,
    bio: data.bio ?? null,
    gender: data.gender ?? null,
    skills: data.skills ?? [],
    goals: data.goals ?? [],
    verificationStatus: data.verificationStatus ?? null,
    isActive: data.isActive ?? true,
  };
}

// --- Profile ---
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  skills: string[];
  goals: string[];
};

export async function fetchProfile(): Promise<Profile> {
  return apiJson<Profile>("/api/profile/me");
}

export async function updateProfile(data: {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: string;
  skills?: string[];
  goals?: string[];
  role?: "mentee" | "mentor";
}): Promise<Profile> {
  return apiJson<Profile>("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// --- Session ratings ---
export async function submitSessionRating(
  sessionId: string,
  data: { rating: number; comment: string; tags: string[] }
): Promise<{ id: string }> {
  return apiJson<{ id: string }>(`/api/sessions/${sessionId}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// --- Sessions API ---

export type SessionUser = { id: string; name: string | null; avatarUrl: string | null };
export type SessionMessagePayload = {
  id: string;
  senderId: string;
  senderName: string | null;
  text: string;
  createdAt: string;
};

export type SessionListItem = {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  videoRoomUrl: string | null;
  mentor: SessionUser;
  mentee: SessionUser;
};

export type MentorListItem = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string;
  bio: string | null;
  skills: string[];
  averageRating: number | null;
  ratingCount: number;
  matchScore?: number;
};

export type MentorDetail = MentorListItem & {
  ratingCount: number;
};

export type MentorRatingItem = {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
  rater: { id: string; name: string | null };
  session: { id: string; topic: string; scheduledAt: string };
};

export async function fetchMentors(): Promise<MentorListItem[]> {
  return apiJson<MentorListItem[]>("/api/mentors");
}

/** Recommended mentors for the current mentee (by skills/goals match). */
export async function fetchRecommendedMentors(): Promise<MentorListItem[]> {
  return apiJson<MentorListItem[]>("/api/mentors/recommended");
}

export async function fetchMentor(id: string): Promise<MentorDetail> {
  return apiJson<MentorDetail>(`/api/mentors/${id}`);
}

export async function fetchMentorRatings(mentorId: string): Promise<MentorRatingItem[]> {
  return apiJson<MentorRatingItem[]>(`/api/mentors/${mentorId}/ratings`);
}

export type SessionDetail = SessionListItem & {
  messages: Array<{
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
    sender: { id: string; name: string | null };
  }>;
};

export async function fetchSessions(): Promise<SessionListItem[]> {
  return apiJson<SessionListItem[]>("/api/sessions");
}

export async function fetchSession(id: string): Promise<SessionDetail> {
  return apiJson<SessionDetail>(`/api/sessions/${id}`);
}

export async function createSession(body: {
  mentorId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
}): Promise<SessionDetail> {
  return apiJson<SessionDetail>("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateSessionStatus(
  id: string,
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
): Promise<SessionListItem> {
  return apiJson<SessionListItem>(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function ensureSessionRoom(id: string): Promise<{ url: string }> {
  return apiJson<{ url: string }>(`/api/sessions/${id}/room`, { method: "POST" });
}

export async function sendSessionMessage(
  sessionId: string,
  text: string
): Promise<SessionMessagePayload> {
  const res = await apiJson<SessionMessagePayload & { sender?: { id: string; name: string | null } }>(
    `/api/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }
  );
  return {
    id: res.id,
    senderId: res.senderId ?? res.sender?.id ?? "",
    senderName: res.sender?.name ?? null,
    text: res.text,
    createdAt: res.createdAt,
  };
}

// --- Mentor: requests ---
export type MentorshipRequestItem = {
  id: string;
  menteeId: string;
  mentorId: string;
  topic: string;
  message: string;
  preferredTime: string | null;
  status: string;
  createdAt: string;
  mentee: { id: string; name: string | null; avatarUrl: string | null };
};

export async function fetchMentorRequests(): Promise<MentorshipRequestItem[]> {
  return apiJson<MentorshipRequestItem[]>("/api/mentor/requests");
}

export async function respondMentorshipRequest(
  requestId: string,
  status: "accepted" | "declined"
): Promise<MentorshipRequestItem> {
  return apiJson<MentorshipRequestItem>(`/api/mentor/requests/${requestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function createMentorshipRequest(body: {
  mentorId: string;
  topic: string;
  message: string;
  preferredTime?: string;
}): Promise<unknown> {
  return apiJson(`/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- Mentor: mentees ---
export type MentorMenteeListItem = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  sessionsCompleted: number;
  nextSession: {
    id: string;
    topic: string;
    scheduledAt: string;
    durationMinutes: number;
  } | null;
};

export async function fetchMentorMentees(): Promise<MentorMenteeListItem[]> {
  return apiJson<MentorMenteeListItem[]>("/api/mentor/mentees");
}

export type MentorMenteeDetail = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string;
  createdAt: string;
  sessions: Array<{
    id: string;
    topic: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
  }>;
  sessionsCompleted: number;
};

export async function fetchMentorMentee(menteeId: string): Promise<MentorMenteeDetail> {
  return apiJson<MentorMenteeDetail>(`/api/mentor/mentees/${menteeId}`);
}

// ── Notifications ──────────────────────────────────────────────────────────────

export type NotificationItem = {
  id: string;
  type: "message" | "session" | "request" | "system";
  title: string;
  description: string | null;
  read: boolean;
  related_id: string | null;
  created_at: string;
};

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return apiJson<NotificationItem[]>("/api/notifications");
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  return apiJson<NotificationItem>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>("/api/notifications/read-all", {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  return apiJson<{ success: boolean }>(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}

// ── Mentor Application (4-Step Form) ────────────────────────────────────────

export type MentorApplicationStatus = {
  id: string;
  mentorId: string;
  status: string;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  submittedAt: string | null;
  createdAt: string;
};

export type MentorApplicationReview = {
  id: string;
  mentorId: string;
  phoneNumber: string;
  location: string;
  gender: string | null;
  step1Completed: boolean;
  jobTitle: string;
  company: string | null;
  yearsExperience: number;
  linkedinUrl: string | null;
  skills: string[];
  professionalBio: string;
  step2Completed: boolean;
  idDocumentUrl: string;
  idDocumentType: string;
  professionalCertificateUrl: string;
  step3Completed: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// Step 1: Personal Information
export async function submitApplicationStep1(data: {
  phoneNumber: string;
  location: string;
  gender?: string;
}): Promise<MentorApplicationStatus> {
  return apiJson<MentorApplicationStatus>("/api/mentor/apply/step1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Step 2: Professional Background
export async function submitApplicationStep2(data: {
  jobTitle: string;
  company?: string;
  yearsExperience: number;
  linkedinUrl?: string;
  skills: string[];
  professionalBio: string;
}): Promise<MentorApplicationStatus> {
  return apiJson<MentorApplicationStatus>("/api/mentor/apply/step2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Step 3: Documents
export async function submitApplicationStep3(data: {
  idDocumentUrl: string;
  idDocumentType: string;
  professionalCertificateUrl: string;
}): Promise<MentorApplicationStatus> {
  return apiJson<MentorApplicationStatus>("/api/mentor/apply/step3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Step 4: Submit
export async function submitApplicationFinal(): Promise<{ message: string; application: MentorApplicationStatus }> {
  return apiJson<{ message: string; application: MentorApplicationStatus }>("/api/mentor/apply/step4", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

// Get application status
export async function fetchApplicationStatus(): Promise<MentorApplicationStatus> {
  return apiJson<MentorApplicationStatus>("/api/mentor/application");
}

// Get full application for review
export async function fetchApplicationReview(): Promise<MentorApplicationReview> {
  return apiJson<MentorApplicationReview>("/api/mentor/application/review");
}

// Upload document
export async function uploadDocument(file: File, subfolder: string = "verification"): Promise<string> {
  const base = getApiUrl();
  if (!base) throw new Error("API URL not configured");
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${base}/api/profile/upload-doc?subfolder=${subfolder}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.url;
}
