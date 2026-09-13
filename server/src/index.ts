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

    if (!name) {
      return res.status(400).json({
        message: "Habit name is required."
      });
    }

    const result = await pool.query(
      `INSERT INTO habits (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, description, archived, created_at`,
      [userId, name, description || null]
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

    const result = await pool.query(
      `UPDATE habits
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         archived = COALESCE($3, archived)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, description, archived, created_at`,
      [name, description, archived, habitId, userId]
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


app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});