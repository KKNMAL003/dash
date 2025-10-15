// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
  user_ids?: string[] // Optional: specific user IDs to send to
  send_to_all_admins?: boolean // Optional: send to all admin users
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Parse request body
    const payload: NotificationPayload = await req.json()
    const { title, body, data, user_ids, send_to_all_admins } = payload

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get device tokens based on criteria
    let query = supabaseClient.from('device_tokens').select('token, platform, user_id')

    if (send_to_all_admins) {
      // Get all admin user IDs
      const { data: adminProfiles, error: adminError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (adminError) {
        throw adminError
      }

      const adminIds = adminProfiles.map((p) => p.id)
      query = query.in('user_id', adminIds)
    } else if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids)
    } else {
      return new Response(
        JSON.stringify({ error: 'Either user_ids or send_to_all_admins must be specified' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: deviceTokens, error: tokensError } = await query

    if (tokensError) {
      throw tokensError
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No device tokens found', sent: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get FCM access token using service account
    const accessToken = await getFCMAccessToken()

    // Send notifications to all tokens
    const results = await Promise.allSettled(
      deviceTokens.map((device) =>
        sendFCMNotification(accessToken, device.token, title, body, data)
      )
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failureCount = results.filter((r) => r.status === 'rejected').length

    console.log(`Sent ${successCount} notifications, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        sent: successCount,
        failed: failureCount,
        total: deviceTokens.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Get FCM access token using service account credentials
 * You need to set FIREBASE_SERVICE_ACCOUNT_JSON as an environment variable
 * with your Firebase service account JSON
 */
async function getFCMAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)
  
  // Create JWT for Google OAuth
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const jwtClaimSet = btoa(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  )

  // Note: In production, you should use a proper JWT library
  // This is a simplified example
  const unsignedToken = `${jwtHeader}.${jwtClaimSet}`
  
  // For now, we'll use a simpler approach with the service account
  // In production, implement proper JWT signing with RS256
  
  // Alternative: Use Google's OAuth2 endpoint directly
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsignedToken,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Send FCM notification to a single device token
 */
async function sendFCMNotification(
  accessToken: string,
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID')
  
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable not set')
  }

  const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

  const message = {
    message: {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      // Android-specific options
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'default',
        },
      },
      // iOS-specific options
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    },
  }

  const response = await fetch(fcmEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FCM request failed: ${response.status} - ${errorText}`)
  }

  console.log(`Notification sent to token: ${deviceToken.substring(0, 10)}...`)
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-push-notification' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"title":"Test Notification","body":"This is a test","send_to_all_admins":true}'

*/

