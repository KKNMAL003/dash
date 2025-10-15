import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

/**
 * Initialize push notifications for native platforms
 * This will request permissions, register for push, and handle token updates
 */
export async function initPushNotifications(userId: string): Promise<void> {
  // Only run on native platforms (iOS/Android)
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native platforms');
    return;
  }

  try {
    // Request permission to use push notifications
    const permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions();
      if (result.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }
    } else if (permStatus.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // Add listeners
    setupPushListeners(userId);

    console.log('Push notifications initialized successfully');
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    toast.error('Failed to initialize push notifications');
  }
}

/**
 * Setup push notification listeners
 */
function setupPushListeners(userId: string): void {
  // On successful registration, save the token
  PushNotifications.addListener('registration', async (token: Token) => {
    console.log('Push registration success, token:', token.value);
    await saveDeviceToken(userId, token.value);
  });

  // Handle registration errors
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('Push registration error:', error);
    toast.error('Failed to register for push notifications');
  });

  // Show notification when app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    // Show a toast for foreground notifications
    toast.success(notification.title || 'New notification', {
      duration: 5000,
    });
  });

  // Handle notification tap
  PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
    console.log('Push notification action performed:', notification);
    handleNotificationTap(notification);
  });
}

/**
 * Save device token to Supabase
 */
async function saveDeviceToken(userId: string, token: string): Promise<void> {
  try {
    const platform = Capacitor.getPlatform(); // 'ios' or 'android'
    
    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token',
        }
      );

    if (error) {
      console.error('Error saving device token:', error);
      throw error;
    }

    console.log('Device token saved successfully');
  } catch (error) {
    console.error('Failed to save device token:', error);
    toast.error('Failed to register device for notifications');
  }
}

/**
 * Handle notification tap - navigate to relevant screen
 */
function handleNotificationTap(notification: ActionPerformed): void {
  const data = notification.notification.data;
  
  // Navigate based on notification type
  if (data.type === 'order_new' && data.order_id) {
    // Navigate to order details
    window.location.href = `/orders?id=${data.order_id}`;
  } else if (data.type === 'message_new' && data.message_id) {
    // Navigate to chat/messages
    window.location.href = `/chat?id=${data.message_id}`;
  } else {
    // Default: navigate to home
    window.location.href = '/';
  }
}

/**
 * Remove device token when user signs out
 */
export async function removePushNotifications(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Get current token
    const platform = Capacitor.getPlatform();
    
    // Remove from database
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    if (error) {
      console.error('Error removing device token:', error);
    }

    // Unregister from push notifications
    await PushNotifications.removeAllListeners();
    
    console.log('Push notifications removed successfully');
  } catch (error) {
    console.error('Failed to remove push notifications:', error);
  }
}

