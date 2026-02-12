-- 002_enums.sql — Enums do e-Kai
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('operador', 'admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tool_call_status') THEN
    CREATE TYPE tool_call_status AS ENUM ('success', 'error', 'timeout');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'feature_status_change',
      'loop_start',
      'loop_stop',
      'loop_limit_reached',
      'feature_max_retries',
      'kai_proactive_alert'
    );
  END IF;
END $$;
