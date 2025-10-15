// Edge Function to send push notifications when a new message is created
// This function is triggered by a Supabase Database Webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse webhook payload
    const payload = await req.json()
    console.log('Webhook payload:', payload)

    // Extract message data from webhook
    const { record, type } = payload
    
    if (type !== 'INSERT') {
      return new Response(
        JSON.stringify({ message: 'Not an INSERT event, skipping' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const message = record
    
    if (!message || !message.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid message data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Only send notifications for messages from customers (not from admins)
    if (message.sender_type === 'admin') {
      return new Response(
        JSON.stringify({ message: 'Message from admin, skipping notification' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create notification payload
    const notificationPayload = {
      title: 'New Message',
      body: message.message?.substring(0, 100) || 'You have a new message',
      data: {
        type: 'message_new',
        message_id: message.id,
        conversation_id: message.conversation_id || '',
      },
      send_to_all_admins: true,
    }

    // Call the send-push-notification function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to send notification: ${errorText}`)
    }

    const result = await response.json()
    console.log('Notification sent:', result)

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully', result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in notify-new-message:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

