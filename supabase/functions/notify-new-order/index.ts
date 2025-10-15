// Edge Function to send push notifications when a new order is created
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

    // Extract order data from webhook
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

    const order = record
    
    if (!order || !order.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid order data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create notification payload
    const notificationPayload = {
      title: 'New Order Received',
      body: `Order #${order.order_number || order.id.substring(0, 8)} from ${order.customer_name || 'a customer'}`,
      data: {
        type: 'order_new',
        order_id: order.id,
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
    console.error('Error in notify-new-order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

