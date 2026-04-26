-- =====================================================================
-- Lottie's Worry Board — initial schema (no-auth version)
-- All objects prefixed with `lwb_` to coexist non-destructively with
-- other projects in the same Supabase database.
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE).
--
-- This version is intentionally open: the anon key has full CRUD access
-- to lwb_ tables. The deployment is gated only by the unguessable
-- Vercel URL. Treat it like a private gist — fine for personal use,
-- not appropriate for sensitive multi-user data.
-- =====================================================================

-- ---------- helper: updated_at trigger ----------
CREATE OR REPLACE FUNCTION lwb_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- worries table ----------
CREATE TABLE IF NOT EXISTS lwb_worries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- captured by Lottie
  title               text NOT NULL,
  description         text,
  feelings            text,
  emotion_tags        text[] NOT NULL DEFAULT '{}',
  intensity_initial   smallint NOT NULL CHECK (intensity_initial BETWEEN 1 AND 10),
  intensity_resolved  smallint CHECK (intensity_resolved BETWEEN 1 AND 10),

  -- worry tree
  can_act_on          boolean NOT NULL,
  action_needed       text,
  set_down_note       text,

  -- Brad's response
  brads_promise       text,
  brads_promise_eta   text,
  promised_at         timestamptz,

  -- lifecycle
  status              text NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new','seen','in_progress','done','set_down')),
  seen_at             timestamptz,
  completed_at        timestamptz,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- If upgrading from the auth-based schema, drop the old owner_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lwb_worries' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE lwb_worries DROP COLUMN owner_id;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS lwb_worries_status_idx
  ON lwb_worries (status);

CREATE INDEX IF NOT EXISTS lwb_worries_created_idx
  ON lwb_worries (created_at DESC);

DROP TRIGGER IF EXISTS lwb_worries_set_updated_at ON lwb_worries;
CREATE TRIGGER lwb_worries_set_updated_at
  BEFORE UPDATE ON lwb_worries
  FOR EACH ROW EXECUTE FUNCTION lwb_set_updated_at();

-- ---------- settings (singleton row, id = 1) ----------
CREATE TABLE IF NOT EXISTS lwb_settings (
  id                    smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  dog_name              text,
  worry_time_enabled    boolean NOT NULL DEFAULT false,
  worry_time_hour       smallint NOT NULL DEFAULT 19 CHECK (worry_time_hour BETWEEN 0 AND 23),
  show_companion        boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- If upgrading: drop owner_id and migrate to singleton id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lwb_settings' AND column_name = 'owner_id'
  ) THEN
    -- old schema present; nuke and reseed (low risk: settings are trivial to recreate)
    DELETE FROM lwb_settings;
    ALTER TABLE lwb_settings DROP COLUMN owner_id CASCADE;
  END IF;
END$$;

-- Seed the singleton row if missing
INSERT INTO lwb_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS lwb_settings_set_updated_at ON lwb_settings;
CREATE TRIGGER lwb_settings_set_updated_at
  BEFORE UPDATE ON lwb_settings
  FOR EACH ROW EXECUTE FUNCTION lwb_set_updated_at();

-- ---------- Row Level Security ----------
-- RLS enabled with permissive policies for both anon and authenticated roles.
-- Privacy comes from the unguessable URL, not from auth.
ALTER TABLE lwb_worries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwb_settings ENABLE ROW LEVEL SECURITY;

-- Drop any leftover auth-scoped policies from the previous schema
DROP POLICY IF EXISTS lwb_worries_select_own  ON lwb_worries;
DROP POLICY IF EXISTS lwb_worries_insert_own  ON lwb_worries;
DROP POLICY IF EXISTS lwb_worries_update_own  ON lwb_worries;
DROP POLICY IF EXISTS lwb_worries_delete_own  ON lwb_worries;
DROP POLICY IF EXISTS lwb_settings_select_own ON lwb_settings;
DROP POLICY IF EXISTS lwb_settings_insert_own ON lwb_settings;
DROP POLICY IF EXISTS lwb_settings_update_own ON lwb_settings;

-- Open policies: anon + authenticated can do everything on these tables
DROP POLICY IF EXISTS lwb_worries_anon_all ON lwb_worries;
CREATE POLICY lwb_worries_anon_all ON lwb_worries
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS lwb_settings_anon_all ON lwb_settings;
CREATE POLICY lwb_settings_anon_all ON lwb_settings
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
