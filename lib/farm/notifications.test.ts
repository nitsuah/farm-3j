import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addNotification,
  useNotifications,
  clearNotifications,
  type NotificationType,
} from './notifications';
import { renderHook, act } from '@testing-library/react';

describe('Notification System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearNotifications();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearNotifications();
  });

  describe('addNotification', () => {
    it('creates notification with default type and duration', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Test message');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]?.message).toBe('Test message');
      expect(result.current.notifications[0]?.type).toBe('info');
      expect(result.current.notifications[0]?.duration).toBe(3000);
    });

    it('creates notification with custom type', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Warning message', 'warning');
      });

      expect(result.current.notifications[0]?.type).toBe('warning');
    });

    it('creates notification with custom duration', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Custom duration', 'info', 5000);
      });

      expect(result.current.notifications[0]?.duration).toBe(5000);
    });

    it('creates success notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Success!', 'success');
      });

      expect(result.current.notifications[0]?.type).toBe('success');
    });

    it('creates error notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Error occurred', 'error');
      });

      expect(result.current.notifications[0]?.type).toBe('error');
    });

    it('generates unique ID for each notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('First');
        addNotification('Second');
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0]?.id).not.toBe(
        result.current.notifications[1]?.id
      );
    });

    it('auto-removes notification after duration', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Auto remove', 'info', 1000);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('does not auto-remove notification with duration 0', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Persistent', 'info', 0);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('handles multiple notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('First', 'info');
        addNotification('Second', 'warning');
        addNotification('Third', 'error');
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications[0]?.message).toBe('First');
      expect(result.current.notifications[1]?.message).toBe('Second');
      expect(result.current.notifications[2]?.message).toBe('Third');
    });
  });

  describe('useNotifications hook', () => {
    it('returns empty notifications initially', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
    });

    it('updates when notification is added', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('New notification');
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('provides removeNotification function', () => {
      const { result } = renderHook(() => useNotifications());

      expect(typeof result.current.removeNotification).toBe('function');
    });

    it('removes notification by ID', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('To be removed');
      });

      const notificationId = result.current.notifications[0]?.id;

      act(() => {
        result.current.removeNotification(notificationId!);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('removes specific notification from multiple', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('First');
        addNotification('Second');
        addNotification('Third');
      });

      const secondId = result.current.notifications[1]?.id;

      act(() => {
        result.current.removeNotification(secondId!);
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0]?.message).toBe('First');
      expect(result.current.notifications[1]?.message).toBe('Third');
    });

    it('cleans up listener on unmount', () => {
      const { unmount } = renderHook(() => useNotifications());
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Test');
      });

      expect(result.current.notifications).toHaveLength(1);

      unmount();

      act(() => {
        addNotification('After unmount');
      });

      // First hook should still receive the notification
      expect(result.current.notifications).toHaveLength(2);
    });
  });

  describe('Multiple listeners', () => {
    it('notifies all active listeners', () => {
      const { result: result1 } = renderHook(() => useNotifications());
      const { result: result2 } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Broadcast message');
      });

      expect(result1.current.notifications).toHaveLength(1);
      expect(result2.current.notifications).toHaveLength(1);
      expect(result1.current.notifications[0]?.message).toBe(
        'Broadcast message'
      );
      expect(result2.current.notifications[0]?.message).toBe(
        'Broadcast message'
      );
    });

    it('removes notification for all listeners', () => {
      const { result: result1 } = renderHook(() => useNotifications());
      const { result: result2 } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Shared notification');
      });

      const notifId = result1.current.notifications[0]?.id;

      act(() => {
        result1.current.removeNotification(notifId!);
      });

      expect(result1.current.notifications).toHaveLength(0);
      expect(result2.current.notifications).toHaveLength(0);
    });
  });

  describe('Notification queue behavior', () => {
    it('maintains notification order', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('First');
        addNotification('Second');
        addNotification('Third');
      });

      expect(result.current.notifications[0]?.message).toBe('First');
      expect(result.current.notifications[1]?.message).toBe('Second');
      expect(result.current.notifications[2]?.message).toBe('Third');
    });

    it('handles rapid additions', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        for (let i = 0; i < 10; i++) {
          addNotification(`Message ${i}`);
        }
      });

      expect(result.current.notifications).toHaveLength(10);
    });

    it('handles removal during auto-remove', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Will auto-remove', 'info', 1000);
        addNotification('Manual remove', 'info', 5000);
      });

      const manualId = result.current.notifications[1]?.id;

      act(() => {
        result.current.removeNotification(manualId!);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('handles removing non-existent notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('Exists');
      });

      act(() => {
        result.current.removeNotification('non-existent-id');
      });

      expect(result.current.notifications).toHaveLength(1);
    });

    it('handles empty message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        addNotification('');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]?.message).toBe('');
    });

    it('handles special characters in message', () => {
      const { result } = renderHook(() => useNotifications());
      const specialMessage = '⚠️ 💰 Test <script>alert("XSS")</script>';

      act(() => {
        addNotification(specialMessage);
      });

      expect(result.current.notifications[0]?.message).toBe(specialMessage);
    });

    it('handles all notification types', () => {
      const { result } = renderHook(() => useNotifications());
      const types: NotificationType[] = ['success', 'warning', 'error', 'info'];

      act(() => {
        types.forEach(type => {
          addNotification(`${type} message`, type);
        });
      });

      expect(result.current.notifications).toHaveLength(4);
      types.forEach((type, index) => {
        expect(result.current.notifications[index]?.type).toBe(type);
      });
    });
  });
});
