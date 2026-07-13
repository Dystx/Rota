-- The authenticated application actor may read only its own capability rows.
-- Administrative capability management remains covered by the existing ALL policy.
CREATE POLICY capability_grants_actor_read ON app.capability_grants
  FOR SELECT TO rumia_app
  USING (subject_user_id = private.current_actor_id());
