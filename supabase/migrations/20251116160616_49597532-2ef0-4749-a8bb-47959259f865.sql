-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id),
  vet_id UUID NOT NULL,
  pet_owner_id UUID NOT NULL,
  pet_name TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  diagnosis TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add payment fields to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS consultation_type TEXT DEFAULT 'general';

-- Enable RLS on prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for prescriptions
CREATE POLICY "Vets can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = vet_id);

CREATE POLICY "Vets can view their prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = vet_id);

CREATE POLICY "Pet owners can view their prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Vets can update their prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = vet_id);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create trigger for prescriptions updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;