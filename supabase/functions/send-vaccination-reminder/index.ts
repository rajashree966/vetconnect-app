import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get vaccinations due within 7 days
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const { data: vaccinations, error: vaccinationError } = await supabase
      .from('vaccination_schedule')
      .select(`
        *,
        profiles:pet_owner_id (email, full_name)
      `)
      .eq('status', 'pending')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0])
      .eq('reminder_sent', false);

    if (vaccinationError) throw vaccinationError;

    console.log(`Found ${vaccinations?.length || 0} vaccinations due`);

    // Send email for each vaccination
    for (const vaccination of vaccinations || []) {
      const emailHtml = `
        <h2>Vaccination Reminder</h2>
        <p>Dear ${vaccination.profiles.full_name},</p>
        <p>This is a reminder that your pet <strong>${vaccination.pet_name}</strong> is due for vaccination:</p>
        <ul>
          <li><strong>Vaccine:</strong> ${vaccination.vaccine_name}</li>
          <li><strong>Due Date:</strong> ${new Date(vaccination.due_date).toLocaleDateString()}</li>
        </ul>
        <p>Please schedule an appointment with your veterinarian.</p>
        <p>Best regards,<br>Pet Care Team</p>
      `;

      console.log(`Sending reminder to ${vaccination.profiles.email} for ${vaccination.pet_name}`);

      // Mark as sent
      await supabase
        .from('vaccination_schedule')
        .update({ reminder_sent: true })
        .eq('id', vaccination.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: vaccinations?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
