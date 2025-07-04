import { supabase } from '../lib/supabase';

export async function testChatFunctionality() {
  console.log('=== Chat Functionality Debug ===');
  
  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return false;
    }
    console.log('✓ User authenticated:', user?.id);

    // Test 2: Check communication_logs table access
    console.log('2. Testing communication_logs table access...');
    const { data: logs, error: logsError } = await supabase
      .from('communication_logs')
      .select('id, message, created_at')
      .limit(1);
    
    if (logsError) {
      console.error('Communication logs error:', logsError);
      return false;
    }
    console.log('✓ Communication logs accessible, count:', logs?.length || 0);

    // Test 3: Check profiles table access
    console.log('3. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'customer')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return false;
    }
    console.log('✓ Profiles accessible, count:', profiles?.length || 0);

    // Test 4: Test real-time subscription
    console.log('4. Testing real-time subscription...');
    const channel = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs',
        },
        (payload) => {
          console.log('✓ Real-time subscription working:', payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Clean up after 5 seconds
    setTimeout(() => {
      channel.unsubscribe();
      console.log('✓ Test subscription cleaned up');
    }, 5000);

    console.log('=== All tests passed ===');
    return true;
  } catch (error) {
    console.error('=== Test failed ===', error);
    return false;
  }
}

// Function to test sending a message
export async function testSendMessage(customerId: string, staffId: string, message: string) {
  console.log('=== Testing Send Message ===');
  
  try {
    const { data, error } = await supabase
      .from('communication_logs')
      .insert({
        user_id: customerId,
        customer_id: customerId,
        staff_id: staffId,
        message: message,
        log_type: 'user_message',
        sender_type: 'staff',
        is_read: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Send message test failed:', error);
      return false;
    }

    console.log('✓ Message sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Send message test error:', error);
    return false;
  }
}
