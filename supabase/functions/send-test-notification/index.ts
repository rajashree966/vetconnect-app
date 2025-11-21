import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, preferredMethod } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Sending test notification to user:', userId, 'via:', preferredMethod);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    let smsSent = false;
    let emailSent = false;

    // Send SMS if preferred or both
    if ((preferredMethod === 'phone' || preferredMethod === 'both') && profile.phone) {
      console.log('Sending test SMS to:', profile.phone);
      const testMessage = `Hello ${profile.full_name}! This is a test notification from Ask Your Vet. Your SMS notifications are working correctly. 🎉`;
      
      const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          to: profile.phone,
          message: testMessage
        }
      });

      if (smsError) {
        console.error('Error sending test SMS:', smsError);
      } else {
        smsSent = true;
      }
    }

    // Send Email if preferred or both
    if ((preferredMethod === 'email' || preferredMethod === 'both') && profile.email) {
      console.log('Sending test email to:', profile.email);
      try {
        await resend.emails.send({
          from: 'Ask Your Vet <onboarding@resend.dev>',
          to: [profile.email],
          subject: 'Test Notification - Ask Your Vet',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Test Notification Successful! 🎉</h2>
              <p>Hello ${profile.full_name},</p>
              <p>This is a test notification from Ask Your Vet. Your email notifications are working correctly!</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Notification Settings:</strong></p>
                <p style="margin: 10px 0 0 0;">You will receive appointment reminders and confirmations via ${
                  preferredMethod === 'phone' ? 'SMS only' :
                  preferredMethod === 'email' ? 'Email only' :
                  'both SMS and Email'
                }.</p>
              </div>
              <p>You can update your notification preferences anytime in your dashboard.</p>
              <p>Best regards,<br>Ask Your Vet Team</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Error sending test email:', emailError);
      }
    }

    const message = smsSent && emailSent 
      ? 'Test SMS and email sent successfully!'
      : smsSent 
        ? 'Test SMS sent successfully!'
        : emailSent 
          ? 'Test email sent successfully!'
          : 'No notifications sent. Please check your contact information.';

    return new Response(
      JSON.stringify({ 
        success: smsSent || emailSent,
        message,
        smsSent,
        emailSent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-test-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
