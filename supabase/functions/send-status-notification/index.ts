import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

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

    const { appointmentId, newStatus, petOwnerPhone, petOwnerEmail, petOwnerName, vetName, petName, appointmentDate, appointmentTime, consultationType } = await req.json();

    if (!appointmentId || !newStatus) {
      throw new Error('Appointment ID and status are required');
    }

    console.log('Sending status notification for appointment:', appointmentId, 'status:', newStatus);

    // Get status message
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'confirmed':
          return `Great news! Your appointment for ${petName} with Dr. ${vetName} on ${appointmentDate} at ${appointmentTime} has been CONFIRMED. ${consultationType === 'sports_training' ? 'Please bring any relevant training equipment.' : 'Please arrive 10 minutes early.'}`;
        case 'cancelled':
          return `Your appointment for ${petName} with Dr. ${vetName} on ${appointmentDate} at ${appointmentTime} has been CANCELLED. Please contact us to reschedule if needed.`;
        case 'completed':
          return `Your appointment for ${petName} with Dr. ${vetName} has been marked as COMPLETED. Thank you for visiting! Please follow any prescribed care instructions.`;
        default:
          return `Your appointment status has been updated to: ${status}`;
      }
    };

    const statusMessage = getStatusMessage(newStatus);
    let smsSent = false;
    let emailSent = false;

    // Send SMS notification
    if (petOwnerPhone) {
      try {
        const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: petOwnerPhone,
            message: statusMessage
          }
        });

        if (smsError) {
          console.error('Error sending SMS:', smsError);
        } else {
          smsSent = true;
          console.log('SMS sent successfully');
        }
      } catch (smsErr) {
        console.error('SMS error:', smsErr);
      }
    }

    // Send Email notification
    if (petOwnerEmail) {
      try {
        const statusColor = newStatus === 'confirmed' ? '#22c55e' : newStatus === 'cancelled' ? '#ef4444' : '#3b82f6';
        const statusIcon = newStatus === 'confirmed' ? '✅' : newStatus === 'cancelled' ? '❌' : '✔️';

        await resend.emails.send({
          from: 'Ask Your Vet <onboarding@resend.dev>',
          to: [petOwnerEmail],
          subject: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - ${petName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${statusColor};">${statusIcon} Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h2>
              <p>Hello ${petOwnerName},</p>
              <p>${statusMessage}</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Pet:</strong> ${petName}</p>
                <p><strong>Veterinarian:</strong> Dr. ${vetName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                ${consultationType ? `<p><strong>Type:</strong> ${consultationType === 'sports_training' ? 'Sports Training' : consultationType}</p>` : ''}
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
              </div>
              ${newStatus === 'confirmed' && consultationType === 'sports_training' ? `
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #1e40af;">🏃 Sports Training Tips</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                    <li>Ensure your pet has had a light meal 2-3 hours before training</li>
                    <li>Bring plenty of water and treats for motivation</li>
                    <li>Wear comfortable clothing as you may need to participate</li>
                    <li>Arrive 15 minutes early for warm-up exercises</li>
                  </ul>
                </div>
              ` : ''}
              <p>Best regards,<br>Ask Your Vet Team</p>
            </div>
          `,
        });
        emailSent = true;
        console.log('Email sent successfully');
      } catch (emailErr) {
        console.error('Email error:', emailErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: smsSent || emailSent,
        message: `Status notification sent`,
        smsSent,
        emailSent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-status-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
