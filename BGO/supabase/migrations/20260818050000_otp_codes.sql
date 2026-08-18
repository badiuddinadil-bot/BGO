-- BGO SERVER-SIDE OTP STORAGE
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email
ON public.otp_codes(email);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'otp_codes'
          AND policyname = 'Deny direct public client access'
    ) THEN
        CREATE POLICY "Deny direct public client access"
        ON public.otp_codes
        FOR ALL
        USING (false);
    END IF;
END
$$;
