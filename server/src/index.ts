import express from "express";
import cors from "cors";

const app = express();


app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    message: "Habit Tracker API radi!"
  });
});

app.get("/api/habits", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Read 20 minutes",
      completed: false
    },
    {
      id: 2,
      name: "Workout",
      completed: true
    }
  ]);
});

app.listen(3000, () => {
  console.log("Server radi na http://localhost:3000");
});