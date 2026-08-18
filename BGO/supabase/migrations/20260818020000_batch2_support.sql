-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 2 BATCH 2 (JOBS, MEDICAL & HELPLINE MODULES)
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- Migration File: 20260818020000_batch2_support.sql
-- Description: Creates public.jobs, public.medical_requests, public.helpline_requests and RLS policies
-- ZERO DROP / ZERO DESTRUCTIVE OPERATIONS
-- ============================================================================

-- 1. Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    location TEXT DEFAULT 'Muscat, Oman',
    salary TEXT,
    type TEXT DEFAULT 'Full-Time',
    poster_name TEXT,
    contact_email TEXT,
    posted_by TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    description TEXT NOT NULL,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Medical Requests Table
CREATE TABLE IF NOT EXISTS public.medical_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    hospital TEXT NOT NULL,
    location TEXT DEFAULT 'Muscat, Oman',
    required_units INTEGER DEFAULT 1,
    urgency TEXT DEFAULT 'Urgent' CHECK (urgency IN ('Standard', 'Urgent', 'Critical')),
    contact_number TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
    posted_by TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Helpline Requests Table
CREATE TABLE IF NOT EXISTS public.helpline_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    type TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on Batch 2 Tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpline_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Jobs
-- Public can view approved jobs; Admins can view all jobs
CREATE POLICY "Jobs read policy" ON public.jobs
FOR SELECT USING (
    status = 'approved' OR public.is_admin_or_superadmin() OR auth.uid() = poster_id
);

-- Authenticated users can insert jobs
CREATE POLICY "Jobs insert policy" ON public.jobs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR public.is_admin_or_superadmin()
);

-- Job poster or Admin can update jobs
CREATE POLICY "Jobs update policy" ON public.jobs
FOR UPDATE USING (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
) WITH CHECK (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
);

-- Job poster or Admin can delete jobs
CREATE POLICY "Jobs delete policy" ON public.jobs
FOR DELETE USING (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
);

-- 6. RLS Policies for Medical Requests
-- Public can view open medical requests; Admins can view all
CREATE POLICY "Medical read policy" ON public.medical_requests
FOR SELECT USING (
    status = 'open' OR public.is_admin_or_superadmin() OR auth.uid() = poster_id
);

-- Anyone / Authenticated can submit medical request
CREATE POLICY "Medical insert policy" ON public.medical_requests
FOR INSERT WITH CHECK (true);

-- Poster or Admin can update medical request
CREATE POLICY "Medical update policy" ON public.medical_requests
FOR UPDATE USING (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
) WITH CHECK (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
);

-- Poster or Admin can delete medical request
CREATE POLICY "Medical delete policy" ON public.medical_requests
FOR DELETE USING (
    auth.uid() = poster_id OR public.is_admin_or_superadmin()
);

-- 7. RLS Policies for Helpline Requests
-- Anyone can submit helpline emergency calls
CREATE POLICY "Helpline insert policy" ON public.helpline_requests
FOR INSERT WITH CHECK (true);

-- Only Admins/Superadmins can read and update helpline tickets
CREATE POLICY "Helpline admin read policy" ON public.helpline_requests
FOR SELECT USING (public.is_admin_or_superadmin());

CREATE POLICY "Helpline admin update policy" ON public.helpline_requests
FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Helpline admin delete policy" ON public.helpline_requests
FOR DELETE USING (public.is_admin_or_superadmin());
