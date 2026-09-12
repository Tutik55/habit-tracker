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

app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});