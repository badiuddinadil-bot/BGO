-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 1 ADDITIVE COMPLETION MIGRATION
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- File: supabase/migrations/STEP1_ADDITIVE_COMPLETION.sql
-- Description: Creates ONLY the 4 missing Step 1 objects without dropping or modifying existing objects.
-- ZERO DROP / ZERO DELETE / ZERO MODIFICATIONS TO EXISTING TABLES OR TRIGGERS
-- ============================================================================

-- 1. Function: Automatic Profile Creation on auth.users Signup
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

-- 2. Trigger: Call handle_new_user() on auth.users Insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function: Helper for Admin & Super Admin RLS Privileges
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

-- 4. Function: Helper for Super Admin RLS Privileges
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
