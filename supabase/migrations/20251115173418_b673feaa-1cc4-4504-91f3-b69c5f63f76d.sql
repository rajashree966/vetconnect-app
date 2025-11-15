-- Create storage buckets for medical documents and consultation videos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('medical-documents', 'medical-documents', false),
  ('consultation-videos', 'consultation-videos', true);

-- Create medical_records table with file attachments
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_owner_id UUID NOT NULL,
  pet_name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vaccination', 'checkup', 'treatment', 'surgery')),
  title TEXT NOT NULL,
  description TEXT,
  veterinarian TEXT,
  file_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccination_schedule table
CREATE TABLE public.vaccination_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_owner_id UUID NOT NULL,
  pet_name TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultation_videos table
CREATE TABLE public.consultation_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vet_id UUID NOT NULL,
  pet_owner_id UUID NOT NULL,
  appointment_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add emergency contact fields to pet_owner_profiles
ALTER TABLE public.pet_owner_profiles
ADD COLUMN emergency_contact_name TEXT,
ADD COLUMN emergency_contact_phone TEXT,
ADD COLUMN emergency_contact_relationship TEXT,
ADD COLUMN preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'sms'));

-- Add contact preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN instagram_handle TEXT,
ADD COLUMN facebook_profile TEXT;

-- Enable RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records
CREATE POLICY "Pet owners can view their own medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can insert their own medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can update their own medical records"
  ON public.medical_records FOR UPDATE
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can delete their own medical records"
  ON public.medical_records FOR DELETE
  USING (auth.uid() = pet_owner_id);

-- RLS Policies for vaccination_schedule
CREATE POLICY "Pet owners can view their own vaccination schedules"
  ON public.vaccination_schedule FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can manage their own vaccination schedules"
  ON public.vaccination_schedule FOR ALL
  USING (auth.uid() = pet_owner_id);

-- RLS Policies for consultation_videos
CREATE POLICY "Vets can insert consultation videos"
  ON public.consultation_videos FOR INSERT
  WITH CHECK (auth.uid() = vet_id);

CREATE POLICY "Vets can view their own consultation videos"
  ON public.consultation_videos FOR SELECT
  USING (auth.uid() = vet_id);

CREATE POLICY "Pet owners can view their consultation videos"
  ON public.consultation_videos FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Vets can update their own consultation videos"
  ON public.consultation_videos FOR UPDATE
  USING (auth.uid() = vet_id);

CREATE POLICY "Vets can delete their own consultation videos"
  ON public.consultation_videos FOR DELETE
  USING (auth.uid() = vet_id);

-- Storage policies for medical documents
CREATE POLICY "Pet owners can upload their medical documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Pet owners can view their medical documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Pet owners can delete their medical documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for consultation videos
CREATE POLICY "Vets can upload consultation videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'consultation-videos');

CREATE POLICY "Anyone can view consultation videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consultation-videos');

CREATE POLICY "Vets can delete consultation videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'consultation-videos');

-- Triggers for updated_at
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccination_schedule_updated_at
  BEFORE UPDATE ON public.vaccination_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_videos_updated_at
  BEFORE UPDATE ON public.consultation_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();