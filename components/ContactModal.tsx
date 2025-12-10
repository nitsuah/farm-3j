'use client';

import { useState } from 'react';
import { Cornfield } from './animations/Cornfield';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
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

        <form className="space-y-4">
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
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="Your name"
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
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="your@email.com"
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
              rows={4}
              className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-800 dark:text-white"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
