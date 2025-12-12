import { useEffect, useState } from 'react';
import { useFarm } from '@/lib/farm/FarmContext';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Simple notification queue
let notificationQueue: Notification[] = [];
let notificationListeners: ((notifications: Notification[]) => void)[] = [];

export function addNotification(
  message: string,
  type: NotificationType = 'info',
  duration = 3000
) {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random()}`,
    message,
    type,
    duration,
  };

  notificationQueue.push(notification);
  notifyListeners();

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);
  }
}

function removeNotification(id: string) {
  notificationQueue = notificationQueue.filter(n => n.id !== id);
  notifyListeners();
}

function notifyListeners() {
  notificationListeners.forEach(
    (listener: (notifications: Notification[]) => void) =>
      listener([...notificationQueue])
  );
}

// Test utility to clear all notifications
export function clearNotifications() {
  notificationQueue = [];
  notifyListeners();
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    notificationListeners.push(listener);
    listener(notificationQueue);

    return () => {
      notificationListeners = notificationListeners.filter(
        (l: (notification: Notification[]) => void) => l !== listener
      );
    };
  }, []);

  return { notifications, removeNotification };
}

// Farm event notifications
export function useFarmNotifications() {
  const { state } = useFarm();

  useEffect(() => {
    // Notify when fence health is low
    if (state.fenceHealth < 30 && state.fenceHealth > 0) {
      addNotification('⚠️ Fence health is low! Repair soon.', 'warning', 5000);
    }

    // Notify when animal health is low
    if (state.animalHealth < 40 && state.animalHealth > 0) {
      addNotification(
        '⚠️ Animal health is declining! Consider healing.',
        'warning',
        5000
      );
    }
  }, [state.fenceHealth, state.animalHealth]);

  useEffect(() => {
    // Notify when money is running low
    if (state.money < 100 && state.money > 0) {
      addNotification(
        '💰 Low on funds! Sell resources to earn money.',
        'warning',
        5000
      );
    }
  }, [state.money]);
}
