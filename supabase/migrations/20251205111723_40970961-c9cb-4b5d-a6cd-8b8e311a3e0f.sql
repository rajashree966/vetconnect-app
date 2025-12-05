-- Create a public view for vet profiles that hides sensitive license information
CREATE VIEW public.vet_profiles_public AS
SELECT 
  id,
  specialization,
  years_of_experience,
  clinic_name,
  clinic_address,
  available_days,
  available_hours_start,
  available_hours_end
FROM public.vet_profiles;

-- Grant access to the view
GRANT SELECT ON public.vet_profiles_public TO anon, authenticated;

-- Update the RLS policy on vet_profiles to restrict public access
DROP POLICY IF EXISTS "Anyone can view vet profiles" ON public.vet_profiles;

-- Only vets can view their own full profile (including license number)
CREATE POLICY "Vets can view their own full profile" 
ON public.vet_profiles 
FOR SELECT 
USING (auth.uid() = id);