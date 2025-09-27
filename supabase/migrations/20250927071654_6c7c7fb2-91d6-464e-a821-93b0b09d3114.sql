-- Create email verification table for PIN-based verification
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add email verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on email_verifications table
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_verifications
CREATE POLICY "Users can view their own email verifications" 
ON public.email_verifications 
FOR SELECT 
USING (true); -- Allow reading for PIN verification

CREATE POLICY "Users can insert email verifications" 
ON public.email_verifications 
FOR INSERT 
WITH CHECK (true); -- Allow inserting for PIN generation

CREATE POLICY "Users can update their own email verifications" 
ON public.email_verifications 
FOR UPDATE 
USING (true) -- Allow updating for PIN verification attempts
WITH CHECK (true);

-- Create index for efficient PIN lookups
CREATE INDEX idx_email_verifications_email_expires ON public.email_verifications(email, expires_at);

-- Create function to clean up expired PINs
CREATE OR REPLACE FUNCTION public.cleanup_expired_pins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_verifications 
  WHERE expires_at < now() AND verified = false;
END;
$$;