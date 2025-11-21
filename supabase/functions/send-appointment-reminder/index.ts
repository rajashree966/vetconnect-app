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

    // Get appointments happening in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    console.log('Checking appointments between:', todayStr, 'and', tomorrowStr);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pet_owner:profiles!appointments_pet_owner_id_fkey(full_name, email, phone),
        vet:profiles!appointments_vet_id_fkey(full_name, email, phone)
      `)
      .eq('status', 'confirmed')
      .gte('appointment_date', todayStr)
      .lte('appointment_date', tomorrowStr);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    console.log('Found appointments:', appointments?.length || 0);

    let remindersSent = 0;

    for (const appointment of appointments || []) {
      console.log('Processing appointment:', appointment.id);

      // Fetch pet owner preferences
      const { data: ownerProfile } = await supabase
        .from('pet_owner_profiles')
        .select('preferred_contact_method')
        .eq('id', appointment.pet_owner_id)
        .single();

      const preferredMethod = ownerProfile?.preferred_contact_method || 'phone';

      // Send notification to pet owner
      const ownerMessage = `Reminder: You have an appointment with Dr. ${appointment.vet.full_name} tomorrow at ${appointment.appointment_time} for ${appointment.pet_name}. Reason: ${appointment.reason}`;
      
      // Send SMS if preferred or both
      if ((preferredMethod === 'phone' || preferredMethod === 'both') && appointment.pet_owner?.phone) {
        console.log('Sending SMS to pet owner:', appointment.pet_owner.phone);
        const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: appointment.pet_owner.phone,
            message: ownerMessage
          }
        });

        if (smsError) {
          console.error('Error sending SMS to owner:', smsError);
        } else {
          remindersSent++;
        }
      }

      // Send Email if preferred or both
      if ((preferredMethod === 'email' || preferredMethod === 'both') && appointment.pet_owner?.email) {
        console.log('Sending email to pet owner:', appointment.pet_owner.email);
        try {
          await resend.emails.send({
            from: 'Ask Your Vet <onboarding@resend.dev>',
            to: [appointment.pet_owner.email],
            subject: 'Appointment Reminder - Tomorrow',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Appointment Reminder</h2>
                <p>Hello ${appointment.pet_owner.full_name},</p>
                <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Pet:</strong> ${appointment.pet_name}</p>
                  <p><strong>Date:</strong> ${appointment.appointment_date}</p>
                  <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                  <p><strong>Veterinarian:</strong> Dr. ${appointment.vet.full_name}</p>
                  <p><strong>Reason:</strong> ${appointment.reason}</p>
                </div>
                <p>Please arrive 10 minutes early for check-in.</p>
                <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
                <p>Best regards,<br>Ask Your Vet Team</p>
              </div>
            `,
          });
          remindersSent++;
        } catch (emailError) {
          console.error('Error sending email to owner:', emailError);
        }
      }

      // Send notification to vet (always SMS and Email)
      const vetMessage = `Reminder: You have an appointment tomorrow at ${appointment.appointment_time} with ${appointment.pet_owner.full_name}'s pet ${appointment.pet_name}. Consultation type: ${appointment.consultation_type || 'general'}`;
      
      if (appointment.vet?.phone) {
        console.log('Sending SMS to vet:', appointment.vet.phone);
        const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: appointment.vet.phone,
            message: vetMessage
          }
        });

        if (smsError) {
          console.error('Error sending SMS to vet:', smsError);
        } else {
          remindersSent++;
        }
      }

      if (appointment.vet?.email) {
        console.log('Sending email to vet:', appointment.vet.email);
        try {
          await resend.emails.send({
            from: 'Ask Your Vet <onboarding@resend.dev>',
            to: [appointment.vet.email],
            subject: 'Appointment Reminder - Tomorrow',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Appointment Reminder</h2>
                <p>Hello Dr. ${appointment.vet.full_name},</p>
                <p>This is a reminder that you have an appointment scheduled for tomorrow:</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Pet Owner:</strong> ${appointment.pet_owner.full_name}</p>
                  <p><strong>Pet:</strong> ${appointment.pet_name} (${appointment.pet_type})</p>
                  <p><strong>Date:</strong> ${appointment.appointment_date}</p>
                  <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                  <p><strong>Consultation Type:</strong> ${appointment.consultation_type || 'general'}</p>
                  <p><strong>Reason:</strong> ${appointment.reason}</p>
                </div>
                <p>Please review the appointment details and prepare accordingly.</p>
                <p>Best regards,<br>Ask Your Vet Team</p>
              </div>
            `,
          });
          remindersSent++;
        } catch (emailError) {
          console.error('Error sending email to vet:', emailError);
        }
      }
    }


    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${remindersSent} appointment reminders`,
        appointments_checked: appointments?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-appointment-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
