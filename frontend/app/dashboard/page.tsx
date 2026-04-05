"use client";

import { useState, useCallback, useEffect } from "react";
import apiClient from "@/lib/api";

interface Feedback {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  ai_sentiment: string;
  ai_priority: number;
  ai_summary: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
}

interface Stats {
  totalFeedback: number;
  openItems: number;
  averagePriority: number;
  mostCommonTag: string;
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("date");
  const [search, setSearch] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      loadFeedback();
      loadStats();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFeedback();
    }
  }, [page, category, status, sort, search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await apiClient.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data.success) {
        localStorage.setItem("authToken", response.data.data.token);
        setIsAuthenticated(true);
        setLoginEmail("");
        setLoginPassword("");
        loadFeedback();
        loadStats();
      }
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (search) params.append("search", search);

      const response = await apiClient.get(
        `/api/feedback?${params.toString()}`,
      );
      if (response.data.success) {
        setFeedback(response.data.data.feedback);
      }
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get("/api/feedback/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Session expired. Please log in again.");
        setIsAuthenticated(false);
        return;
      }

      const response = await apiClient.patch(`/api/feedback/${feedbackId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        setFeedback((prev) =>
          prev.map((f) =>
            f._id === feedbackId ? { ...f, status: newStatus } : f,
          ),
        );
        loadStats();
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      alert("Error: " + (error.response?.data?.message || "Failed to update"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setFeedback([]);
    setStats(null);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Negative":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100";
      case "In Review":
        return "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-slate-900 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
            <div className="mb-10 text-center">
              <div className="inline-block mb-4">
                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl">🔐</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">FeedPulse</h1>
              <p className="text-slate-600 font-medium">Admin Access</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@feedpulse.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all font-medium text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-8 shadow-lg hover:shadow-xl"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 mt-8 pt-8 border-t border-slate-200 font-medium">
              Demo: admin@feedpulse.com / admin123456
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Main Dashboard
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FeedPulse</h1>
            <p className="text-sm text-slate-600 font-medium">Management Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Feedback", value: stats.totalFeedback, color: "slate" },
              { label: "Open Items", value: stats.openItems, color: "amber" },
              { label: "Avg Priority", value: typeof stats.averagePriority === 'number' ? stats.averagePriority.toFixed(1) : stats.averagePriority, color: "purple" },
              { label: "Top Tag", value: stats.mostCommonTag || "N/A", color: "emerald" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 rounded-2xl p-7 hover:shadow-lg transition-all duration-300`}
              >
                <p className={`text-xs font-bold text-${stat.color}-700 uppercase tracking-wider mb-2`}>{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-900`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Filter & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-5 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all text-sm font-medium text-slate-900 placeholder-slate-500"
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-5 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all text-sm font-medium text-slate-900"
            >
              <option value="">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Improvement">Improvement</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-5 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all text-sm font-medium text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-5 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all text-sm font-medium text-slate-900"
            >
              <option value="date">Newest First</option>
              <option value="priority">Highest Priority</option>
            </select>
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setStatus("");
                setSort("date");
                setPage(1);
              }}
              className="px-5 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wider border border-slate-300 hover:bg-slate-100 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {feedbackLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-full mb-4 animate-pulse">
              <div className="w-6 h-6 border-3 border-white border-t-slate-900 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-semibold">Loading feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-semibold">No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.description.substring(0, 100)}...
                    </p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusUpdate(item._id, e.target.value)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer border transition-all ${getStatusColor(item.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-slate-200">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {item.category}
                  </span>
                  {item.ai_sentiment && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getSentimentColor(item.ai_sentiment)}`}>
                      {item.ai_sentiment}
                    </span>
                  )}
                  {item.ai_priority && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                      Priority: {item.ai_priority}/10
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 mb-4 font-medium">
                  {item.submitterName && <span>{item.submitterName}</span>}
                  {item.submitterEmail && <span> • {item.submitterEmail}</span>}
                  <span> • {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {item.ai_summary && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-sm text-slate-700 font-medium">
                    <strong className="text-blue-900">AI Analysis:</strong> {item.ai_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
