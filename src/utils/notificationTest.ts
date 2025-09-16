// Test utility for the notification system
// This can be used to manually test notifications in the browser console

import { supabase } from '../lib/supabase';

export async function testOrderNotification() {
  // Create a test order to trigger notification
  const testOrder = {
    customer_id: 'test-customer-id',
    status: 'pending' as const,
    total_amount: 25.99,
    delivery_address: '123 Test Street',
    delivery_phone: '+1234567890',
    payment_method: 'card' as const,
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
  };

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    if (error) {
      console.error('Error creating test order:', error);
      return;
    }

    console.log('Test order created:', data);
    console.log('Check the notification bell - you should see a new order notification!');
    
    // Clean up after 5 seconds
    setTimeout(async () => {
      await supabase.from('orders').delete().eq('id', data.id);
      console.log('Test order cleaned up');
    }, 5000);

  } catch (err) {
    console.error('Error in test:', err);
  }
}

export async function testMessageNotification() {
  // Create a test message to trigger notification
  const testMessage = {
    customer_id: 'test-customer-id',
    log_type: 'customer_inquiry',
    subject: 'Test Message',
    message: 'This is a test message from a customer',
    sender_type: 'customer' as const,
  };

  try {
    const { data, error } = await supabase
      .from('communication_logs')
      .insert(testMessage)
      .select()
      .single();

    if (error) {
      console.error('Error creating test message:', error);
      return;
    }

    console.log('Test message created:', data);
    console.log('Check the notification bell - you should see a new message notification!');
    
    // Clean up after 5 seconds
    setTimeout(async () => {
      await supabase.from('communication_logs').delete().eq('id', data.id);
      console.log('Test message cleaned up');
    }, 5000);

  } catch (err) {
    console.error('Error in test:', err);
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testOrderNotification = testOrderNotification;
  (window as any).testMessageNotification = testMessageNotification;
}
