-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 2 BATCH 4 (AUDIT LOGS & EMAIL DISPATCHES)
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- Migration File: 20260818040000_batch4_audit_and_logs.sql
-- Description: Creates public.audit_logs, public.email_logs, public.email_recipients and idempotent RLS policies
-- ZERO DROP / ZERO DESTRUCTIVE OPERATIONS
-- ============================================================================

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    performed_by TEXT DEFAULT 'system',
    user_role TEXT DEFAULT 'member',
    ip_address TEXT,
    status TEXT DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    to_name TEXT NOT NULL,
    category TEXT DEFAULT 'General System Notification',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'DELIVERED ✅',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Email Recipients Table
CREATE TABLE IF NOT EXISTS public.email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Emergency Coordinator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;

-- 5. Idempotent RLS Policies for Audit Logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Audit logs read policy') THEN
        CREATE POLICY "Audit logs read policy" ON public.audit_logs FOR SELECT USING (public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Audit logs insert policy') THEN
        CREATE POLICY "Audit logs insert policy" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Audit logs superadmin delete policy') THEN
        CREATE POLICY "Audit logs superadmin delete policy" ON public.audit_logs FOR DELETE USING (public.is_superadmin());
    END IF;
END $$;

-- 6. Idempotent RLS Policies for Email Logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_logs' AND policyname = 'Email logs read policy') THEN
        CREATE POLICY "Email logs read policy" ON public.email_logs FOR SELECT USING (public.is_admin_or_superadmin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_logs' AND policyname = 'Email logs insert policy') THEN
        CREATE POLICY "Email logs insert policy" ON public.email_logs FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_logs' AND policyname = 'Email logs superadmin delete policy') THEN
        CREATE POLICY "Email logs superadmin delete policy" ON public.email_logs FOR DELETE USING (public.is_superadmin());
    END IF;
END $$;

-- 7. Idempotent RLS Policies for Email Recipients
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_recipients' AND policyname = 'Email recipients admin policy') THEN
        CREATE POLICY "Email recipients admin policy" ON public.email_recipients FOR ALL USING (public.is_admin_or_superadmin()) WITH CHECK (public.is_admin_or_superadmin());
    END IF;
END $$;
