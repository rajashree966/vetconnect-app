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

    // Get current time and time 1 hour from now
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];

    // Format times for comparison (HH:MM format)
    const currentTime = now.toTimeString().slice(0, 5);
    const targetTime = oneHourFromNow.toTimeString().slice(0, 5);

    console.log('Checking for appointments between', currentTime, 'and', targetTime, 'on', todayStr);

    // Get confirmed appointments happening in the next hour
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pet_owner:profiles!appointments_pet_owner_id_fkey(id, full_name, email, phone),
        vet:profiles!appointments_vet_id_fkey(full_name, email, phone)
      `)
      .eq('status', 'confirmed')
      .eq('appointment_date', todayStr)
      .gte('appointment_time', currentTime)
      .lte('appointment_time', targetTime);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    console.log('Found appointments starting soon:', appointments?.length || 0);

    let remindersSent = 0;

    for (const appointment of appointments || []) {
      console.log('Processing 1-hour reminder for appointment:', appointment.id);

      // Check if we already sent a 1-hour reminder (using notes field as a simple tracker)
      if (appointment.notes?.includes('[1HR_REMINDER_SENT]')) {
        console.log('1-hour reminder already sent for:', appointment.id);
        continue;
      }

      // Get pet owner preferences
      const { data: ownerProfile } = await supabase
        .from('pet_owner_profiles')
        .select('preferred_contact_method')
        .eq('id', appointment.pet_owner_id)
        .single();

      const preferredMethod = ownerProfile?.preferred_contact_method || 'phone';

      // Send reminder to pet owner
      const ownerMessage = `⏰ REMINDER: Your appointment with Dr. ${appointment.vet.full_name} for ${appointment.pet_name} starts in about 1 hour at ${appointment.appointment_time}. ${appointment.consultation_type === 'sports_training' ? 'Remember to bring training equipment!' : 'Please arrive 10 minutes early.'}`;

      // Send SMS if preferred
      if ((preferredMethod === 'phone' || preferredMethod === 'both') && appointment.pet_owner?.phone) {
        console.log('Sending 1-hour SMS reminder to pet owner');
        const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: appointment.pet_owner.phone,
            message: ownerMessage
          }
        });

        if (smsError) {
          console.error('Error sending SMS:', smsError);
        } else {
          remindersSent++;
        }
      }

      // Send Email if preferred
      if ((preferredMethod === 'email' || preferredMethod === 'both') && appointment.pet_owner?.email) {
        console.log('Sending 1-hour email reminder to pet owner');
        try {
          await resend.emails.send({
            from: 'Ask Your Vet <onboarding@resend.dev>',
            to: [appointment.pet_owner.email],
            subject: `⏰ 1 Hour Reminder - Appointment for ${appointment.pet_name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">⏰ Your Appointment Starts Soon!</h2>
                <p>Hello ${appointment.pet_owner.full_name},</p>
                <p>This is a friendly reminder that your appointment is starting in about <strong>1 hour</strong>!</p>
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0;"><strong>🐾 Pet:</strong> ${appointment.pet_name}</p>
                  <p style="margin: 10px 0 0 0;"><strong>👨‍⚕️ Veterinarian:</strong> Dr. ${appointment.vet.full_name}</p>
                  <p style="margin: 10px 0 0 0;"><strong>📅 Date:</strong> Today</p>
                  <p style="margin: 10px 0 0 0;"><strong>🕐 Time:</strong> ${appointment.appointment_time}</p>
                  ${appointment.consultation_type ? `<p style="margin: 10px 0 0 0;"><strong>📋 Type:</strong> ${appointment.consultation_type === 'sports_training' ? 'Sports Training' : appointment.consultation_type}</p>` : ''}
                  <p style="margin: 10px 0 0 0;"><strong>📝 Reason:</strong> ${appointment.reason}</p>
                </div>
                ${appointment.consultation_type === 'sports_training' ? `
                  <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af;"><strong>🏃 Sports Training Checklist:</strong></p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
                      <li>Training equipment ready</li>
                      <li>Water bottle for your pet</li>
                      <li>Treats for motivation</li>
                      <li>Comfortable shoes for you</li>
                    </ul>
                  </div>
                ` : `
                  <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #166534;"><strong>✅ Quick Checklist:</strong></p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #166534;">
                      <li>Arrive 10 minutes early</li>
                      <li>Bring any previous medical records</li>
                      <li>Have your questions ready</li>
                      <li>Keep your pet secure during travel</li>
                    </ul>
                  </div>
                `}
                <p>See you soon!</p>
                <p>Best regards,<br>Ask Your Vet Team</p>
              </div>
            `,
          });
          remindersSent++;
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }

      // Send reminder to vet
      if (appointment.vet?.phone) {
        const vetMessage = `⏰ REMINDER: Appointment in 1 hour at ${appointment.appointment_time} with ${appointment.pet_owner.full_name}'s pet ${appointment.pet_name}. Type: ${appointment.consultation_type || 'general'}`;
        await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: appointment.vet.phone,
            message: vetMessage
          }
        });
      }

      // Mark appointment as having received 1-hour reminder
      const updatedNotes = appointment.notes 
        ? `${appointment.notes} [1HR_REMINDER_SENT]` 
        : '[1HR_REMINDER_SENT]';
      
      await supabase
        .from('appointments')
        .update({ notes: updatedNotes })
        .eq('id', appointment.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${remindersSent} 1-hour reminders`,
        appointments_checked: appointments?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-hourly-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
