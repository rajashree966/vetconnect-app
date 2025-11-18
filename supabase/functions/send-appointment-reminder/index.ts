import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

      // Send notification to pet owner
      if (appointment.pet_owner?.phone) {
        console.log('Sending SMS to pet owner:', appointment.pet_owner.phone);
        const ownerMessage = `Reminder: You have an appointment with Dr. ${appointment.vet.full_name} tomorrow at ${appointment.appointment_time} for ${appointment.pet_name}. Reason: ${appointment.reason}`;
        
        // Call SMS function
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

      // Send notification to vet
      if (appointment.vet?.phone) {
        console.log('Sending SMS to vet:', appointment.vet.phone);
        const vetMessage = `Reminder: You have an appointment tomorrow at ${appointment.appointment_time} with ${appointment.pet_owner.full_name}'s pet ${appointment.pet_name}. Consultation type: ${appointment.consultation_type || 'general'}`;
        
        // Call SMS function
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
