-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 2 BATCH 3 (MEMBER COORDINATION TOOLS)
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- Migration File: 20260818030000_batch3_coordination.sql
-- Description: Creates public.travel_schedules, public.events, public.event_polls, public.profile_update_requests with idempotent RLS policies
-- ZERO DROP / ZERO DESTRUCTIVE OPERATIONS
-- ============================================================================

-- 1. Helper Security Function for Executive Access
CREATE OR REPLACE FUNCTION public.is_admin_or_executive()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin', 'executive')
    );
END;
$$;

-- 2. Create Travel Schedules Table
CREATE TABLE IF NOT EXISTS public.travel_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    member_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    travel_date DATE NOT NULL,
    travel_time TEXT,
    route TEXT NOT NULL,
    flight_details TEXT,
    remarks TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    venue TEXT,
    description TEXT NOT NULL,
    registered_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Event Polls Table
CREATE TABLE IF NOT EXISTS public.event_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    member_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('alone', 'family', 'not_attending')),
    family_count INTEGER DEFAULT 0,
    responded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_profile_poll UNIQUE(event_id, profile_id)
);

-- 5. Create Profile Update Requests Table
CREATE TABLE IF NOT EXISTS public.profile_update_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    member_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    old_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.travel_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_update_requests ENABLE ROW LEVEL SECURITY;

-- 7. Idempotent RLS Policies for Travel Schedules
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_schedules' AND policyname = 'Travel read policy') THEN
        CREATE POLICY "Travel read policy" ON public.travel_schedules FOR SELECT USING (auth.uid() = profile_id OR public.is_admin_or_executive());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_schedules' AND policyname = 'Travel insert policy') THEN
        CREATE POLICY "Travel insert policy" ON public.travel_schedules FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_schedules' AND policyname = 'Travel update policy') THEN
        CREATE POLICY "Travel update policy" ON public.travel_schedules FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin_or_superadmin()) WITH CHECK (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'travel_schedules' AND policyname = 'Travel delete policy') THEN
        CREATE POLICY "Travel delete policy" ON public.travel_schedules FOR DELETE USING (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
END $$;

-- 8. Idempotent RLS Policies for Events
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Events public read policy') THEN
        CREATE POLICY "Events public read policy" ON public.events FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Events admin insert policy') THEN
        CREATE POLICY "Events admin insert policy" ON public.events FOR INSERT WITH CHECK (public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Events admin update policy') THEN
        CREATE POLICY "Events admin update policy" ON public.events FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Events admin delete policy') THEN
        CREATE POLICY "Events admin delete policy" ON public.events FOR DELETE USING (public.is_admin_or_superadmin());
    END IF;
END $$;

-- 9. Idempotent RLS Policies for Event Polls (Includes Executive Read for Event Coordination)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_polls' AND policyname = 'Polls read policy') THEN
        CREATE POLICY "Polls read policy" ON public.event_polls FOR SELECT USING (auth.uid() = profile_id OR public.is_admin_or_executive());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_polls' AND policyname = 'Polls insert policy') THEN
        CREATE POLICY "Polls insert policy" ON public.event_polls FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_polls' AND policyname = 'Polls update policy') THEN
        CREATE POLICY "Polls update policy" ON public.event_polls FOR UPDATE USING (auth.uid() = profile_id OR public.is_admin_or_superadmin()) WITH CHECK (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_polls' AND policyname = 'Polls delete policy') THEN
        CREATE POLICY "Polls delete policy" ON public.event_polls FOR DELETE USING (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
END $$;

-- 10. Idempotent RLS Policies for Profile Update Requests
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_update_requests' AND policyname = 'Profile update requests read policy') THEN
        CREATE POLICY "Profile update requests read policy" ON public.profile_update_requests FOR SELECT USING (auth.uid() = profile_id OR public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_update_requests' AND policyname = 'Profile update requests insert policy') THEN
        CREATE POLICY "Profile update requests insert policy" ON public.profile_update_requests FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_update_requests' AND policyname = 'Profile update requests admin update policy') THEN
        CREATE POLICY "Profile update requests admin update policy" ON public.profile_update_requests FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_update_requests' AND policyname = 'Profile update requests admin delete policy') THEN
        CREATE POLICY "Profile update requests admin delete policy" ON public.profile_update_requests FOR DELETE USING (public.is_admin_or_superadmin());
    END IF;
END $$;
