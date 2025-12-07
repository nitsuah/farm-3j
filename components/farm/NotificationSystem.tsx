'use client';

import React from 'react';
import {
  useNotifications,
  type NotificationType,
} from '@/lib/farm/notifications';

export function NotificationSystem() {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles =
      'rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm transition-all';

    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-900/80 text-green-100`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-900/80 text-yellow-100`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-900/80 text-red-100`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-blue-900/80 text-blue-100`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(
            notification.type
          )} animate-slide-in-right pointer-events-auto`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-xl leading-none hover:opacity-70"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
