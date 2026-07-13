CREATE POLICY trips_reviewer_update_assigned ON app.trips
  FOR UPDATE TO rumia_app
  USING (
    EXISTS (
      SELECT 1
      FROM app.reviewer_assignments AS assignment
      WHERE assignment.trip_id = trips.id
        AND assignment.reviewer_user_id = private.current_reviewer_id()
        AND assignment.status IN ('assigned', 'submitted')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM app.reviewer_assignments AS assignment
      WHERE assignment.trip_id = trips.id
        AND assignment.reviewer_user_id = private.current_reviewer_id()
        AND assignment.status IN ('assigned', 'submitted')
    )
  );
