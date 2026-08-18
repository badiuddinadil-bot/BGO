-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 2 BATCH 1 (CONTENT & LEADERSHIP MODULES)
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- Migration File: 20260818010000_batch1_content.sql
-- Description: Creates public.news, public.gallery, public.executive_management and safe RLS policies
-- ZERO DROP / ZERO DESTRUCTIVE OPERATIONS
-- ============================================================================

-- 1. Create News Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Announcements',
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Community Events',
    type TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
    image_url TEXT,
    video_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Executive Management Table
CREATE TABLE IF NOT EXISTS public.executive_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_title TEXT NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    region TEXT DEFAULT 'Muscat',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on Batch 1 Tables
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_management ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for News
CREATE POLICY "News public read policy" ON public.news
FOR SELECT USING (true);

CREATE POLICY "News admin insert policy" ON public.news
FOR INSERT WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "News admin update policy" ON public.news
FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "News admin delete policy" ON public.news
FOR DELETE USING (public.is_admin_or_superadmin());

-- 6. RLS Policies for Gallery
CREATE POLICY "Gallery public read policy" ON public.gallery
FOR SELECT USING (true);

CREATE POLICY "Gallery admin insert policy" ON public.gallery
FOR INSERT WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Gallery admin update policy" ON public.gallery
FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Gallery admin delete policy" ON public.gallery
FOR DELETE USING (public.is_admin_or_superadmin());

-- 7. RLS Policies for Executive Management
CREATE POLICY "Executive public read policy" ON public.executive_management
FOR SELECT USING (true);

CREATE POLICY "Executive admin insert policy" ON public.executive_management
FOR INSERT WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Executive admin update policy" ON public.executive_management
FOR UPDATE USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Executive admin delete policy" ON public.executive_management
FOR DELETE USING (public.is_admin_or_superadmin());
