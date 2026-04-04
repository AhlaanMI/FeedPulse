'use client';

import { FormEvent, ChangeEvent, useState } from 'react';
import apiClient from '@/lib/api';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    submitterName: '',
    submitterEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Client-side validation
      if (!formData.title.trim()) {
        setMessage({ type: 'error', text: 'Title is required' });
        setLoading(false);
        return;
      }

      if (formData.title.trim().length < 5) {
        setMessage({ type: 'error', text: 'Title must be at least 5 characters' });
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setMessage({ type: 'error', text: 'Description is required' });
        setLoading(false);
        return;
      }

      if (formData.description.trim().length < 20) {
        setMessage({ type: 'error', text: 'Description must be at least 20 characters' });
        setLoading(false);
        return;
      }

      if (formData.submitterEmail && !formData.submitterEmail.includes('@')) {
        setMessage({ type: 'error', text: 'Please enter a valid email address' });
        setLoading(false);
        return;
      }

      const response = await apiClient.post('/api/feedback', formData);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Thank you! Your feedback has been submitted successfully.'
        });
        setFormData({
          title: '',
          description: '',
          category: 'Other',
          submitterName: '',
          submitterEmail: ''
        });
        setCharCount(0);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit feedback. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-2">FeedPulse</h1>
      <p className="text-gray-600 mb-6">Share your feedback to help us improve</p>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief title of your feedback"
          maxLength={120}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/120</p>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description * (min 20 characters)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Please provide detailed feedback..."
          minLength={20}
          rows={5}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">{charCount}/∞ characters</p>
      </div>

      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="Bug">Bug</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Improvement">Improvement</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="submitterName"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleChange}
            placeholder="Your name (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="submitterEmail"
            name="submitterEmail"
            value={formData.submitterEmail}
            onChange={handleChange}
            placeholder="your@email.com (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Have an admin account?{' '}
          <a href="/dashboard" className="text-blue-600 hover:underline">
            View Dashboard
          </a>
        </p>
      </div>
    </form>
  );
}
