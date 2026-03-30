import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router";
import { Users, Video, TrendingUp, Activity, UserCheck, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getApiUrl, getAccessToken } from "../../../lib/api";
import { toast } from "sonner";

type Stats = {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  monthlySessions: { month: string; count: number }[];
  recentUsers: { id: string; name: string; role: string; email: string; avatarUrl: string | null; createdAt: string }[];
  recentSessions: { id: string; topic: string; status: string; scheduledAt: string | null; mentor: string; mentee: string }[];
};

function statusColor(status: string) {
  switch (status) {
    case "completed": return "bg-emerald-50 text-emerald-700";
    case "scheduled": return "bg-blue-50 text-blue-700";
    case "in_progress": return "bg-indigo-50 text-indigo-700";
    case "cancelled": return "bg-red-50 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function roleColor(role: string) {
  switch (role) {
    case "mentor": return "bg-purple-50 text-purple-700";
    case "admin": return "bg-orange-50 text-orange-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("en-US", { month: "short" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const base = getApiUrl();
        const token = await getAccessToken();
        const res = await fetch(`${base}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load stats");
        setStats(await res.json());
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Mentors", value: stats.totalMentors, icon: UserCheck, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
    { label: "Total Sessions", value: stats.totalSessions, icon: Video, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: CheckCircle, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ] : [];

  const chartData = stats?.monthlySessions.map((m) => ({
    name: formatMonth(m.month),
    sessions: m.count,
  })) ?? [];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and analytics</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 border-0 shadow-lg animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
              <div className="h-8 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {statCards.map((s, i) => (
              <Card key={i} className="p-6 border-0 shadow-lg">
                <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <s.icon className={s.iconColor} size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
                <p className="text-gray-600 text-sm">{s.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6 border-0 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Session Activity (Last 6 Months)</h2>
                {chartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No session data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Recent Sessions */}
              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
                  <Link to="/admin/sessions" className="text-sm text-indigo-600 hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {stats?.recentSessions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No sessions yet</p>
                  ) : (
                    stats?.recentSessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{s.topic}</p>
                          <p className="text-xs text-gray-500">{s.mentor} → {s.mentee}</p>
                        </div>
                        <Badge className={`${statusColor(s.status)} border-0 text-xs`}>
                          {s.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Users */}
            <div>
              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                  </div>
                  <Link to="/admin/users" className="text-sm text-indigo-600 hover:underline">View all</Link>
                </div>
                <div className="space-y-4">
                  {stats?.recentUsers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No users yet</p>
                  ) : (
                    stats?.recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-indigo-600 font-semibold">{(u.name ?? "U")[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                        <Badge className={`${roleColor(u.role)} border-0 text-xs flex-shrink-0`}>
                          {u.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick stats */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock size={14} /> Active Sessions
                    </span>
                    <span className="font-semibold text-gray-900">{stats?.activeSessions ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Users size={14} /> Total Mentees
                    </span>
                    <span className="font-semibold text-gray-900">{stats?.totalMentees ?? 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}