'use client';

import { useState } from 'react';
import { Cornfield } from './animations/Cornfield';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const setFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackType(type);
    setFeedbackMessage(message);
  };

  const resetFeedback = () => {
    setFeedbackType(null);
    setFeedbackMessage('');
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name as keyof ContactFormData]: value }));
    if (feedbackType) {
      resetFeedback();
    }
  };

  const validateForm = () => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedName.length < 2) {
      return 'Please enter your name (at least 2 characters).';
    }

    if (!emailPattern.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }

    if (trimmedMessage.length < 10) {
      return 'Please include a message with at least 10 characters.';
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFeedback('error', validationError);
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          typeof payload.error === 'string'
            ? payload.error
            : 'Unable to send your message right now. Please try again.';
        setFeedback('error', errorMessage);
        return;
      }

      setFeedback('success', 'Thanks! Your message was sent. We will follow up soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setFeedback('error', 'Network error while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with animation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="h-full w-full opacity-30">
          <Cornfield rows={8} cols={16} withTractor={true} />
        </div>
      </div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>

        <h2 className="mb-6 text-center text-3xl font-bold text-green-900 dark:text-white">
          Get in Touch
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="Your message..."
              required
            />
          </div>

          {feedbackType && (
            <div
              role={feedbackType === 'error' ? 'alert' : 'status'}
              className={`rounded-md px-4 py-3 text-sm ${
                feedbackType === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              {feedbackMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
