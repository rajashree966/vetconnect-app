-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
-- This prevents unauthenticated access while still allowing the app to function
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Also add a policy for anon users to NOT see any profiles (explicit deny)
-- This ensures unauthenticated visitors cannot access user data