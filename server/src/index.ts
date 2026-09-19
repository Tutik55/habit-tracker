import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/auth.js";

const app = express();


app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    message: "Habit Tracker API radi!"
  });
});

app.get("/api/habits", authenticateToken, async (req, res) => {
  const userId = res.locals.userId;

  const result = await pool.query(
    "SELECT * FROM habits WHERE user_id = $1 ORDER BY id",
    [userId]
  );

  res.json(result.rows);
});

app.get("/api/db-test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");

  res.json({
    connected: true,
    time: result.rows[0].now,
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (name.trim().length < 2) {
  return res.status(400).json({
    message: "Name must be at least 2 characters long."
  });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({
    message: "Please enter a valid email address."
  });
}

if (password.length < 8) {
  return res.status(400).json({
    message: "Password must be at least 8 characters long."
  });
}

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      jwtSecret,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

app.post("/api/habits", authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { name, description } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
  return res.status(400).json({
    message: "Habit name is required."
  });
}

if (name.trim().length < 2) {
  return res.status(400).json({
    message: "Habit name must be at least 2 characters long."
  });
}

if (name.trim().length > 100) {
  return res.status(400).json({
    message: "Habit name cannot be longer than 100 characters."
  });
}

if (
  description !== undefined &&
  description !== null &&
  typeof description !== "string"
) {
  return res.status(400).json({
    message: "Description must be text."
  });
}

if (description && description.length > 500) {
  return res.status(400).json({
    message: "Description cannot be longer than 500 characters."
  });
}

    const result = await pool.query(
      `INSERT INTO habits (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, description, archived, created_at`,
[
  userId,
  name.trim(),
  description?.trim() || null
]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});


app.patch("/api/habits/:id", authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const habitId = Number(req.params.id);
    const { name, description, archived } = req.body;

    if (Number.isNaN(habitId)) {
      return res.status(400).json({
        message: "Invalid habit id."
      });
    }

    if (name !== undefined) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      message: "Habit name cannot be empty."
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      message: "Habit name must be at least 2 characters long."
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      message: "Habit name cannot be longer than 100 characters."
    });
  }
}

if (
  description !== undefined &&
  description !== null &&
  typeof description !== "string"
) {
  return res.status(400).json({
    message: "Description must be text."
  });
}

if (
  typeof description === "string" &&
  description.length > 500
) {
  return res.status(400).json({
    message: "Description cannot be longer than 500 characters."
  });
}

if (
  archived !== undefined &&
  typeof archived !== "boolean"
) {
  return res.status(400).json({
    message: "Archived must be true or false."
  });
}

    const result = await pool.query(
      `UPDATE habits
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         archived = COALESCE($3, archived)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, description, archived, created_at`,
      [
  typeof name === "string" ? name.trim() : name,
  typeof description === "string"
    ? description.trim()
    : description,
  archived,
  habitId,
  userId
]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

app.delete("/api/habits/:id", authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const habitId = Number(req.params.id);

    if (Number.isNaN(habitId)) {
      return res.status(400).json({
        message: "Invalid habit id."
      });
    }

    const result = await pool.query(
      `DELETE FROM habits
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [habitId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    return res.status(200).json({
      message: "Habit deleted successfully."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});


app.put("/api/habits/:id/schedule", authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const habitId = Number(req.params.id);
    const { days } = req.body;

    if (Number.isNaN(habitId)) {
      return res.status(400).json({
        message: "Invalid habit id."
      });
    }

    if (
      !Array.isArray(days) ||
      days.some(day => !Number.isInteger(day) || day < 1 || day > 7)
    ) {
      return res.status(400).json({
        message: "Days must be an array of numbers from 1 to 7."
      });
    }

    const uniqueDays = new Set(days);

if (uniqueDays.size !== days.length) {
  return res.status(400).json({
    message: "Schedule cannot contain duplicate days."
  });
}

    const habit = await pool.query(
      "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
      [habitId, userId]
    );

    if (habit.rows.length === 0) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    await pool.query(
      "DELETE FROM habit_schedules WHERE habit_id = $1",
      [habitId]
    );

    for (const day of days) {
      await pool.query(
        `INSERT INTO habit_schedules (habit_id, day_of_week)
         VALUES ($1, $2)`,
        [habitId, day]
      );
    }

    const result = await pool.query(
      `SELECT id, habit_id, day_of_week
       FROM habit_schedules
       WHERE habit_id = $1
       ORDER BY day_of_week`,
      [habitId]
    );

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});


app.post("/api/habits/:id/completions", authenticateToken, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const habitId = Number(req.params.id);
    const { completedDate } = req.body;

    if (Number.isNaN(habitId)) {
      return res.status(400).json({
        message: "Invalid habit id."
      });
    }

    if (!completedDate) {
      return res.status(400).json({
        message: "completedDate is required."
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

if (typeof completedDate !== "string" || !dateRegex.test(completedDate)) {
  return res.status(400).json({
    message: "completedDate must be in YYYY-MM-DD format."
  });
}

const parsedDate = new Date(`${completedDate}T00:00:00Z`);

if (Number.isNaN(parsedDate.getTime())) {
  return res.status(400).json({
    message: "Invalid completion date."
  });
}

if (parsedDate.toISOString().slice(0, 10) !== completedDate) {
  return res.status(400).json({
    message: "Invalid completion date."
  });
}

const now = new Date();

const today = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )
);

if (parsedDate > today) {
  return res.status(400).json({
    message: "Completion date cannot be in the future."
  });
}

    const habit = await pool.query(
      "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
      [habitId, userId]
    );

    if (habit.rows.length === 0) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    const result = await pool.query(
      `INSERT INTO habit_completions (habit_id, completed_date)
       VALUES ($1, $2)
       RETURNING id, habit_id, completed_date, created_at`,
      [habitId, completedDate]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Habit is already completed for this date."
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error."
    });
  }
});


app.delete(
  "/api/habits/:id/completions/:date",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const habitId = Number(req.params.id);
      const completedDate = req.params.date;

      if (Number.isNaN(habitId)) {
        return res.status(400).json({
          message: "Invalid habit id."
        });
      }

      const habit = await pool.query(
        "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
        [habitId, userId]
      );

      if (habit.rows.length === 0) {
        return res.status(404).json({
          message: "Habit not found."
        });
      }

      const result = await pool.query(
        `DELETE FROM habit_completions
         WHERE habit_id = $1 AND completed_date = $2
         RETURNING id`,
        [habitId, completedDate]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Completion not found."
        });
      }

      return res.status(200).json({
        message: "Completion removed successfully."
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error."
      });
    }
  }
);



app.get(
  "/api/habits/:id/completions",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const habitId = Number(req.params.id);

      if (Number.isNaN(habitId)) {
        return res.status(400).json({
          message: "Invalid habit id."
        });
      }

      const habit = await pool.query(
        "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
        [habitId, userId]
      );

      if (habit.rows.length === 0) {
        return res.status(404).json({
          message: "Habit not found."
        });
      }

      const result = await pool.query(
       `SELECT
     id,
     habit_id,
     TO_CHAR(completed_date, 'YYYY-MM-DD') AS completed_date,
     created_at
   FROM habit_completions
   WHERE habit_id = $1
   ORDER BY completed_date DESC`,
        [habitId]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error."
      });
    }
  }
);

app.get(
  "/api/habits/:id/stats",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const habitId = Number(req.params.id);

      if (Number.isNaN(habitId)) {
        return res.status(400).json({
          message: "Invalid habit id."
        });
      }

      // 1. Pronađi habit i provjeri da pripada korisniku
      const habitResult = await pool.query(
        `SELECT
     id,
     TO_CHAR(created_at, 'YYYY-MM-DD') AS created_date
   FROM habits
   WHERE id = $1 AND user_id = $2`,
  [habitId, userId]
      );

      if (habitResult.rows.length === 0) {
        return res.status(404).json({
          message: "Habit not found."
        });
      }

      // 2. Učitaj dane kada se habit treba raditi
      const scheduleResult = await pool.query(
        `SELECT day_of_week
         FROM habit_schedules
         WHERE habit_id = $1
         ORDER BY day_of_week`,
        [habitId]
      );

      const scheduleDays = new Set<number>(
        scheduleResult.rows.map(row => row.day_of_week)
      );

      // 3. Učitaj sve completions
      const completionResult = await pool.query(
        `SELECT TO_CHAR(completed_date, 'YYYY-MM-DD') AS completed_date
         FROM habit_completions
         WHERE habit_id = $1`,
        [habitId]
      );

      const completedDates = new Set<string>(
        completionResult.rows.map(row => row.completed_date)
      );

      const createdDate = habitResult.rows[0].created_date;
      const start = new Date(`${createdDate}T00:00:00Z`);

      const now = new Date();

      const today = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate()
        )
      );

      const scheduledDates: string[] = [];

      // 4. Pronađi sve planirane dane od nastanka habita do danas
      for (
        let date = new Date(start);
        date <= today;
        date.setUTCDate(date.getUTCDate() + 1)
      ) {
        const jsDay = date.getUTCDay();

        // JS: Sunday = 0
        // Naša baza: Monday = 1 ... Sunday = 7
        const dayOfWeek = jsDay === 0 ? 7 : jsDay;

        if (scheduleDays.has(dayOfWeek)) {
          scheduledDates.push(date.toISOString().slice(0, 10));
        }
      }

      // 5. Success percentage
      const completedScheduledDays = scheduledDates.filter(date =>
        completedDates.has(date)
      );

      const successPercentage =
        scheduledDates.length === 0
          ? 0
          : Math.round(
              (completedScheduledDays.length / scheduledDates.length) * 100
            );

      // 6. Best streak
      let current = 0;
      let bestStreak = 0;

      for (const date of scheduledDates) {
        if (completedDates.has(date)) {
          current++;
          bestStreak = Math.max(bestStreak, current);
        } else {
          current = 0;
        }
      }

      // 7. Current streak
     let currentStreak = 0;

for (let i = scheduledDates.length - 1; i >= 0; i--) {
  const date = scheduledDates[i];

  if (!date) {
    break;
  }

  if (completedDates.has(date)) {
    currentStreak++;
  } else {
    break;
  }
}

      return res.status(200).json({
        habitId,
        currentStreak,
        bestStreak,
        successPercentage,
        completedScheduledDays: completedScheduledDays.length,
        totalScheduledDays: scheduledDates.length
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error."
      });
    }
  }
);


app.get(
  "/api/habits/:id/schedule",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const habitId = Number(req.params.id);

      if (Number.isNaN(habitId)) {
        return res.status(400).json({
          message: "Invalid habit id."
        });
      }

      const habit = await pool.query(
        "SELECT id FROM habits WHERE id = $1 AND user_id = $2",
        [habitId, userId]
      );

      if (habit.rows.length === 0) {
        return res.status(404).json({
          message: "Habit not found."
        });
      }

      const result = await pool.query(
        `SELECT day_of_week
         FROM habit_schedules
         WHERE habit_id = $1
         ORDER BY day_of_week`,
        [habitId]
      );

      return res.status(200).json({
        habitId,
        days: result.rows.map(row => row.day_of_week)
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error."
      });
    }
  }
);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});