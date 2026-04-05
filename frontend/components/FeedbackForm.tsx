"use client";

import { FormEvent, ChangeEvent, useState } from "react";
import apiClient from "@/lib/api";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    submitterName: "",
    submitterEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "description") {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.title.trim()) {
        setMessage({ type: "error", text: "Title is required" });
        setLoading(false);
        return;
      }

      if (formData.title.trim().length < 5) {
        setMessage({
          type: "error",
          text: "Title must be at least 5 characters",
        });
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setMessage({ type: "error", text: "Description is required" });
        setLoading(false);
        return;
      }

      if (formData.description.trim().length < 20) {
        setMessage({
          type: "error",
          text: "Description must be at least 20 characters",
        });
        setLoading(false);
        return;
      }

      if (formData.submitterEmail && !formData.submitterEmail.includes("@")) {
        setMessage({
          type: "error",
          text: "Please enter a valid email address",
        });
        setLoading(false);
        return;
      }

      const response = await apiClient.post("/api/feedback", formData);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Thank you! Your feedback has been received and will be reviewed shortly.",
        });
        setFormData({
          title: "",
          description: "",
          category: "Other",
          submitterName: "",
          submitterEmail: "",
        });
        setCharCount(0);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit feedback. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4">
          <div className="h-20 w-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl">💬</span>
          </div>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-3 tracking-tight">
          FeedPulse
        </h1>
        <p className="text-xl text-slate-600 font-light max-w-xl mx-auto">
          Your voice shapes our future. Share your insights and help us build products you'll love.
        </p>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-12 backdrop-blur-xl border border-slate-100"
      >
        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-8 p-5 rounded-2xl border transition-all duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <p className="font-semibold text-lg flex items-center gap-3">
              <span className="text-2xl">
                {message.type === "success" ? "✓" : "✕"}
              </span>
              {message.text}
            </p>
          </div>
        )}

        {/* Title Field */}
        <div className="mb-10">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-slate-900 mb-3 block uppercase tracking-wider"
          >
            Feedback Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What's on your mind?"
            maxLength={120}
            required
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all placeholder-slate-400 text-slate-900 font-medium"
          />
          <div className="flex justify-between mt-3">
            <p className="text-xs text-slate-600 font-medium">Be specific and concise</p>
            <p className={`text-xs font-bold ${formData.title.length > 100 ? 'text-red-600' : 'text-slate-500'}`}>
              {formData.title.length}/120
            </p>
          </div>
        </div>

        {/* Description Field */}
        <div className="mb-10">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-slate-900 mb-3 block uppercase tracking-wider"
          >
            Description <span className="text-red-500">*</span>
            <span className="font-normal text-slate-600 normal-case ml-2">(minimum 20 characters)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share the context and details of your feedback..."
            minLength={20}
            rows={6}
            required
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all resize-none placeholder-slate-400 text-slate-900 font-medium"
          />
          <div className="flex justify-between mt-3">
            <p className="text-xs text-slate-600 font-medium">Include relevant context and examples</p>
            <p className={`text-xs font-bold ${charCount < 20 ? 'text-red-600' : charCount > 500 ? 'text-amber-600' : 'text-slate-500'}`}>
              {charCount} characters
            </p>
          </div>
        </div>

        {/* Category Field */}
        <div className="mb-10">
          <label
            htmlFor="category"
            className="text-sm font-semibold text-slate-900 mb-3 block uppercase tracking-wider"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all text-slate-900 font-medium appearance-none cursor-pointer"
          >
            <option value="Bug">🐛 Bug Report</option>
            <option value="Feature Request">⭐ Feature Request</option>
            <option value="Improvement">🚀 Improvement</option>
            <option value="Other">💭 Other</option>
          </select>
        </div>

        {/* Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label
              htmlFor="submitterName"
              className="text-sm font-semibold text-slate-900 mb-3 block uppercase tracking-wider"
            >
              Full Name <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="submitterName"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all placeholder-slate-400 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label
              htmlFor="submitterEmail"
              className="text-sm font-semibold text-slate-900 mb-3 block uppercase tracking-wider"
            >
              Email Address <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              id="submitterEmail"
              name="submitterEmail"
              value={formData.submitterEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 outline-none transition-all placeholder-slate-400 text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg hover:scale-105 transform"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin">⏳</span> Submitting...
            </span>
          ) : (
            "Submit Feedback"
          )}
        </button>

        {/* Footer */}
        <div className="mt-10 pt-10 border-t border-slate-200 text-center">
          <p className="text-slate-600 font-medium">
            Team member?{" "}
            <a
              href="/dashboard"
              className="text-slate-900 font-bold hover:text-slate-700 transition-colors relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 after:transition-all hover:after:w-full"
            >
              Access Dashboard
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
