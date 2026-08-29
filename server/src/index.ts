import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();


app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    message: "Habit Tracker API radi!"
  });
});

app.get("/api/habits", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM habits ORDER BY id"
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

app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});