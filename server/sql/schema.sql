DROP TABLE IF EXISTS habit_completions CASCADE;
DROP TABLE IF EXISTS habit_schedules CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE,

    UNIQUE (habit_id, completed_date)
);

CREATE TABLE habit_schedules (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE,

    UNIQUE (habit_id, day_of_week),
    CHECK (day_of_week BETWEEN 1 AND 7)
);