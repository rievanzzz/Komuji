import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: number;
  type: 'event_reminder' | 'certificate_ready' | 'general';
  title: string;
  message: string;
  event_id?: number;
  event_title?: string;
  event_date?: string;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Check for event reminders
  const checkEventReminders = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get upcoming events for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const response = await fetch(`http://localhost:8000/api/my-registrations?event_date=${tomorrowStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tomorrowEvents = data.data || [];

        // Create notifications for tomorrow's events
        for (const registration of tomorrowEvents) {
          const existingNotif = notifications.find(
            n => n.type === 'event_reminder' && n.event_id === registration.event_id
          );

          if (!existingNotif) {
            await createEventReminder(registration);
          }
        }
      }
    } catch (error) {
      console.error('Error checking event reminders:', error);
    }
  };

  const createEventReminder = async (registration: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'event_reminder',
          title: 'Pengingat Event Besok',
          message: `Jangan lupa! Event "${registration.event.judul}" akan dimulai besok pada ${registration.event.waktu_mulai} WIB di ${registration.event.lokasi}. Pastikan Anda sudah bersiap untuk hadir.`,
          event_id: registration.event_id,
          event_title: registration.event.judul,
          event_date: registration.event.tanggal_mulai
        })
      });
    } catch (error) {
      console.error('Error creating event reminder:', error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Show browser notification
  const showBrowserNotification = (title: string, message: string, eventId?: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        if (eventId) {
          window.location.href = `/events/${eventId}/checkin`;
        }
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Check for event reminders every hour
      const interval = setInterval(checkEventReminders, 60 * 60 * 1000);
      
      // Initial check
      checkEventReminders();

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Check for new notifications every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    showBrowserNotification,
    checkEventReminders
  };
};
