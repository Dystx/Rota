CREATE TABLE private.activity_feedback_rate_limit (
  minute_bucket bigint PRIMARY KEY,
  call_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

REVOKE ALL ON TABLE private.activity_feedback_rate_limit FROM PUBLIC, rumia_app;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION private.consume_activity_feedback_token(max_per_minute integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_bucket bigint := (extract(epoch FROM pg_catalog.now())::bigint / 60);
  new_count integer;
BEGIN
  DELETE FROM private.activity_feedback_rate_limit
  WHERE minute_bucket < current_bucket - 5;

  INSERT INTO private.activity_feedback_rate_limit (minute_bucket, call_count)
  VALUES (current_bucket, 1)
  ON CONFLICT (minute_bucket) DO UPDATE
    SET call_count = private.activity_feedback_rate_limit.call_count + 1,
        updated_at = pg_catalog.now()
  RETURNING call_count INTO new_count;

  RETURN new_count <= max_per_minute;
END;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION private.consume_activity_feedback_token(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.consume_activity_feedback_token(integer) TO rumia_app;
