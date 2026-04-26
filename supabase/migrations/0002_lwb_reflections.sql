-- =====================================================================
-- Lottie's Worry Board — reflections (Socratic CBT prompts)
-- All objects prefixed with `lwb_`. Idempotent — safe to re-run.
-- worry_id is nullable so reflections can stand alone (Reflect quick tool).
-- =====================================================================

CREATE TABLE IF NOT EXISTS lwb_reflections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worry_id        uuid REFERENCES lwb_worries(id) ON DELETE CASCADE,
  question        text NOT NULL,
  answer          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lwb_reflections_worry_idx
  ON lwb_reflections (worry_id, created_at DESC);

DROP TRIGGER IF EXISTS lwb_reflections_set_updated_at ON lwb_reflections;
CREATE TRIGGER lwb_reflections_set_updated_at
  BEFORE UPDATE ON lwb_reflections
  FOR EACH ROW EXECUTE FUNCTION lwb_set_updated_at();

ALTER TABLE lwb_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lwb_reflections_anon_all ON lwb_reflections;
CREATE POLICY lwb_reflections_anon_all ON lwb_reflections
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
