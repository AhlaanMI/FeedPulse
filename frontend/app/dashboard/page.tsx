'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api';

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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('date');
  const [search, setSearch] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
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
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
        setIsAuthenticated(true);
        setLoginEmail('');
        setLoginPassword('');
        loadFeedback();
        loadStats();
      }
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (sort) params.append('sort', sort);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/api/feedback?${params.toString()}`);
      if (response.data.success) {
        setFeedback(response.data.data.feedback);
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/feedback/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await apiClient.patch(`/api/feedback/${feedbackId}`, {
        status: newStatus
      });

      if (response.data.success) {
        setFeedback(prev =>
          prev.map(f => (f._id === feedbackId ? { ...f, status: newStatus } : f))
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setFeedback([]);
    setStats(null);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800';
      case 'Negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-purple-100 text-purple-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto">
          <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-2">FeedPulse</h1>
            <p className="text-gray-600 mb-6">Admin Dashboard Login</p>

            {loginError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@feedpulse.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">FeedPulse Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Feedback</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalFeedback}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Open Items</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.openItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Avg Priority</p>
              <p className="text-3xl font-bold text-purple-600">{stats.averagePriority}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Most Common Tag</p>
              <p className="text-2xl font-bold text-green-600">{stats.mostCommonTag}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Improvement">Improvement</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="date">Newest First</option>
              <option value="priority">Highest Priority</option>
            </select>
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setStatus('');
                setSort('date');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {feedbackLoading ? (
          <div className="text-center py-12">Loading feedback...</div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description.substring(0, 100)}...</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={e => handleStatusUpdate(item._id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-none cursor-pointer ${getStatusColor(item.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                  {item.ai_sentiment && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.ai_sentiment)}`}>
                      {item.ai_sentiment}
                    </span>
                  )}
                  {item.ai_priority && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Priority: {item.ai_priority}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-3 mb-3">
                  {item.submitterName && <span>From: {item.submitterName}</span>}
                  {item.submitterEmail && <span> • {item.submitterEmail}</span>}
                  <span> • {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {item.ai_summary && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                    <strong>AI Summary:</strong> {item.ai_summary}
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
