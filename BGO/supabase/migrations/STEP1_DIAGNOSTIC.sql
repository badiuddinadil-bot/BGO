-- ============================================================================
-- BAHMANI GROUP OMAN (BGO) — STEP 1 COMPLETE READ-ONLY DIAGNOSTIC
-- Project: https://fjtoosmtvgfrvxtjzoqu.supabase.co
-- File: supabase/migrations/STEP1_DIAGNOSTIC.sql
-- Description: Single consolidated 100% Read-Only SELECT query inspecting all Step 1 items
-- ZERO DDL / ZERO DML / ZERO DESTRUCTIVE OPERATIONS
-- ============================================================================

SELECT 1 AS item_no, 'Sequence: public.bgo_member_id_seq' AS item_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'bgo_member_id_seq')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END AS status
UNION ALL
SELECT 2, 'Table: public.profiles',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 3, 'Function: generate_bgo_member_id()',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'generate_bgo_member_id')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 4, 'Trigger: trigger_generate_bgo_member_id (on public.profiles)',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_generate_bgo_member_id')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 5, 'Function: handle_new_user()',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'handle_new_user')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 6, 'Trigger: on_auth_user_created (on auth.users)',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 7, 'Function: get_email_by_username(TEXT)',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_email_by_username')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 8, 'Function: is_admin_or_superadmin()',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'is_admin_or_superadmin')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 9, 'Function: is_superadmin()',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'is_superadmin')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 10, 'RLS Enabled: public.profiles',
       CASE WHEN EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true)
            THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END
UNION ALL
SELECT 11, 'RLS Policy: Profiles read policy',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles read policy')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 12, 'RLS Policy: Profiles update policy',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles update policy')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 13, 'RLS Policy: Profiles insert policy',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles insert policy')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 14, 'RLS Policy: Profiles delete policy',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles delete policy')
            THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
ORDER BY item_no;
