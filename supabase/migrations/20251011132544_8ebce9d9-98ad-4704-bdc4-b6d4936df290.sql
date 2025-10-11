-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing admins from profiles.is_admin to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert all users as 'user' role (admins will have both roles)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update achievements policies
DROP POLICY IF EXISTS "achievements_admin_delete" ON public.achievements;
DROP POLICY IF EXISTS "achievements_admin_update" ON public.achievements;
DROP POLICY IF EXISTS "achievements_admin_write" ON public.achievements;

CREATE POLICY "achievements_admin_delete"
ON public.achievements
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "achievements_admin_update"
ON public.achievements
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "achievements_admin_write"
ON public.achievements
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update categories policies
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;

CREATE POLICY "categories_admin_delete"
ON public.categories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "categories_admin_update"
ON public.categories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "categories_admin_write"
ON public.categories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update content_items policies
DROP POLICY IF EXISTS "content_items_admin_delete" ON public.content_items;
DROP POLICY IF EXISTS "content_items_admin_update" ON public.content_items;
DROP POLICY IF EXISTS "content_items_admin_write" ON public.content_items;

CREATE POLICY "content_items_admin_delete"
ON public.content_items
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "content_items_admin_update"
ON public.content_items
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "content_items_admin_write"
ON public.content_items
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update audio_files policies
DROP POLICY IF EXISTS "audio_files_admin_delete" ON public.audio_files;
DROP POLICY IF EXISTS "audio_files_admin_update" ON public.audio_files;
DROP POLICY IF EXISTS "audio_files_admin_write" ON public.audio_files;

CREATE POLICY "audio_files_admin_delete"
ON public.audio_files
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audio_files_admin_update"
ON public.audio_files
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audio_files_admin_write"
ON public.audio_files
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update region_restrictions policies
DROP POLICY IF EXISTS "Only admins can modify region restrictions" ON public.region_restrictions;
DROP POLICY IF EXISTS "region_restrictions_admin_delete" ON public.region_restrictions;
DROP POLICY IF EXISTS "region_restrictions_admin_update" ON public.region_restrictions;
DROP POLICY IF EXISTS "region_restrictions_admin_write" ON public.region_restrictions;

CREATE POLICY "region_restrictions_admin_delete"
ON public.region_restrictions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "region_restrictions_admin_update"
ON public.region_restrictions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "region_restrictions_admin_write"
ON public.region_restrictions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update user_progress policies
DROP POLICY IF EXISTS "user_progress_admin_all" ON public.user_progress;

CREATE POLICY "user_progress_admin_all"
ON public.user_progress
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update learning_progress policies
DROP POLICY IF EXISTS "learning_progress_admin_all" ON public.learning_progress;

CREATE POLICY "learning_progress_admin_all"
ON public.learning_progress
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update game_sessions policies
DROP POLICY IF EXISTS "game_sessions_admin_all" ON public.game_sessions;

CREATE POLICY "game_sessions_admin_all"
ON public.game_sessions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update user_achievements policies
DROP POLICY IF EXISTS "user_achievements_admin_all" ON public.user_achievements;

CREATE POLICY "user_achievements_admin_all"
ON public.user_achievements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update donations policies
DROP POLICY IF EXISTS "donations_admin_all" ON public.donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;

CREATE POLICY "donations_admin_all"
ON public.donations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update account_deletion_requests policies
DROP POLICY IF EXISTS "Admins can view all deletion requests" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "deletion_requests_admin_all" ON public.account_deletion_requests;

CREATE POLICY "deletion_requests_admin_all"
ON public.account_deletion_requests
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update profiles policies
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_admin_all"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update MFA audit log policy
DROP POLICY IF EXISTS "Admins can view all MFA audit logs" ON public.mfa_audit_log;

CREATE POLICY "Admins can view all MFA audit logs"
ON public.mfa_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Remove is_admin column from profiles (after migration)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;