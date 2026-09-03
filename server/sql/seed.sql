INSERT INTO users (name, email, password_hash)
VALUES ('Test User', 'test@example.com', 'test_hash');

INSERT INTO habits (user_id, name, description)
VALUES (1, 'Workout', '45 minutes of exercise');

INSERT INTO habit_schedules (habit_id, day_of_week)
VALUES
    (1, 1),
    (1, 3),
    (1, 5);

INSERT INTO habit_completions (habit_id, completed_date)
VALUES
    (1, '2026-09-01'),
    (1, '2026-09-03');