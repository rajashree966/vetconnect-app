-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('vet', 'pet_owner');

-- Create enum for appointment status
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table for both vets and pet owners
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vet_profiles table for additional vet information
CREATE TABLE public.vet_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  specialization TEXT NOT NULL,
  years_of_experience INTEGER,
  clinic_name TEXT,
  clinic_address TEXT,
  available_days TEXT[], -- Array of days: ['monday', 'tuesday', etc]
  available_hours_start TIME DEFAULT '09:00',
  available_hours_end TIME DEFAULT '17:00'
);

-- Create pet_owner_profiles table for additional pet owner information
CREATE TABLE public.pet_owner_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  address TEXT,
  emergency_contact TEXT
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status DEFAULT 'pending',
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_appointment_users CHECK (vet_id != pet_owner_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Vet profiles RLS Policies
CREATE POLICY "Anyone can view vet profiles"
  ON public.vet_profiles FOR SELECT
  USING (true);

CREATE POLICY "Vets can insert their own profile"
  ON public.vet_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Vets can update their own profile"
  ON public.vet_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Pet owner profiles RLS Policies
CREATE POLICY "Pet owners can view their own profile"
  ON public.pet_owner_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Pet owners can insert their own profile"
  ON public.pet_owner_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Pet owners can update their own profile"
  ON public.pet_owner_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Appointments RLS Policies
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = vet_id OR auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = pet_owner_id);

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = vet_id OR auth.uid() = pet_owner_id);

CREATE POLICY "Users can delete their own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = vet_id OR auth.uid() = pet_owner_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_appointments_vet_id ON public.appointments(vet_id);
CREATE INDEX idx_appointments_pet_owner_id ON public.appointments(pet_owner_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);