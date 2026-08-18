-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — SUPABASE DATABASE FOUNDATION (STEP 1 STRICT NON-DESTRUCTIVE)
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- Migration File: 20260818000000_auth_foundation.sql
-- Description: Creates public.profiles, BGO Member ID sequence, triggers, and strict RLS policies
-- ZERO DROP / ZERO DESTRUCTIVE OPERATIONS (SUITABLE FOR BRAND-NEW EMPTY SUPABASE PROJECT)
-- ============================================================================

-- 1. Create Member ID Sequence (Thread-Safe Sequence for Concurrent Registrations)
CREATE SEQUENCE IF NOT EXISTS public.bgo_member_id_seq START WITH 1 INCREMENT BY 1;

-- 2. Create Profiles Table (Linked to auth.users ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    father_name TEXT,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    member_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('visitor', 'pending', 'member', 'executive', 'admin', 'superadmin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive', 'deactivated', 'visitor')),
    is_locked BOOLEAN DEFAULT false,
    lock_reason TEXT,
    last_login TIMESTAMPTZ,
    city TEXT DEFAULT 'Muscat',
    native_place TEXT DEFAULT 'Gulbarga',
    india_address TEXT,
    blood_group TEXT DEFAULT 'O+',
    profession TEXT,
    company TEXT,
    work_location TEXT,
    company_address TEXT,
    marital_status TEXT DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    spouse_name TEXT,
    dependents_count INTEGER DEFAULT 0,
    children JSONB DEFAULT '[]'::jsonb,
    emergency_contact_oman JSONB DEFAULT '{}'::jsonb,
    emergency_contact_india JSONB DEFAULT '{}'::jsonb,
    volunteer_interest BOOLEAN DEFAULT false,
    volunteer_skills TEXT,
    photo_url TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Database-Safe Member ID Generation Function & Trigger (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.generate_bgo_member_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    seq_val INT;
    year_str TEXT;
BEGIN
    IF NEW.member_id IS NULL OR NEW.member_id = '' THEN
        year_str := TO_CHAR(NOW(), 'YYYY');
        seq_val := NEXTVAL('public.bgo_member_id_seq');
        NEW.member_id := 'BGO' || year_str || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_bgo_member_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_bgo_member_id();

-- 4. Automatic Profile Creation Function & Trigger on auth.users Signup (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    raw_username TEXT;
    raw_full_name TEXT;
    raw_mobile TEXT;
    raw_whatsapp TEXT;
    raw_city TEXT;
    raw_native TEXT;
    raw_blood TEXT;
    raw_prof TEXT;
    raw_comp TEXT;
BEGIN
    raw_username := LOWER(COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)));
    raw_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'BGO Member');
    raw_mobile := COALESCE(NEW.raw_user_meta_data->>'mobile', '');
    raw_whatsapp := COALESCE(NEW.raw_user_meta_data->>'whatsapp', raw_mobile);
    raw_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Muscat');
    raw_native := COALESCE(NEW.raw_user_meta_data->>'native_place', 'Gulbarga');
    raw_blood := COALESCE(NEW.raw_user_meta_data->>'blood_group', 'O+');
    raw_prof := COALESCE(NEW.raw_user_meta_data->>'profession', '');
    raw_comp := COALESCE(NEW.raw_user_meta_data->>'company', '');

    INSERT INTO public.profiles (
        id,
        username,
        email,
        full_name,
        mobile,
        whatsapp,
        city,
        native_place,
        blood_group,
        profession,
        company,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        raw_username,
        NEW.email,
        raw_full_name,
        raw_mobile,
        raw_whatsapp,
        raw_city,
        raw_native,
        raw_blood,
        raw_prof,
        raw_comp,
        'member',    -- SERVER-ENFORCED DEFAULT ROLE 'member' (Prevents self-promotion)
        'pending',   -- SERVER-ENFORCED DEFAULT STATUS 'pending' (Requires Admin review)
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper Security Functions for Row Level Security (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    );
END;
$$;

-- 6. Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Strict RLS Policies on public.profiles (Zero Data Leakage Boundary)

-- Policy 1: Read Access — A logged-in user can read ONLY their own profile; Admins & Super Admins can read all profiles.
CREATE POLICY "Profiles read policy" ON public.profiles
FOR SELECT
USING (
    auth.uid() = id                      -- A user can read ONLY their own profile record
    OR public.is_admin_or_superadmin()   -- Authorized Admins & Super Admins can read profile records
);

-- Policy 2: Update Access — User can update permitted fields of own profile; Admins can update any profile.
CREATE POLICY "Profiles update policy" ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id OR public.is_admin_or_superadmin()
)
WITH CHECK (
    -- Normal user updating own profile CANNOT modify id, role, status, member_id, or registration timestamps
    (
        auth.uid() = id 
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
        AND member_id = (SELECT member_id FROM public.profiles WHERE id = auth.uid())
        AND registered_at = (SELECT registered_at FROM public.profiles WHERE id = auth.uid())
        AND created_at = (SELECT created_at FROM public.profiles WHERE id = auth.uid())
    )
    OR public.is_admin_or_superadmin()
);

-- Policy 3: Insert Access — Controlled via auth.users trigger, or self-insert forced to member/pending.
CREATE POLICY "Profiles insert policy" ON public.profiles
FOR INSERT
WITH CHECK (
    (auth.uid() = id AND role = 'member' AND status = 'pending')
    OR public.is_admin_or_superadmin()
);

-- Policy 4: Delete Access — Super Admin only.
CREATE POLICY "Profiles delete policy" ON public.profiles
FOR DELETE
USING (
    public.is_superadmin()
);
