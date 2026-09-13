import { useEffect, useState } from "react";

type HabitCompletionProps = {
  habitId: number;
  onChanged: () => void;
};

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function HabitCompletion({
  habitId,
  onChanged,
}: HabitCompletionProps) {
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");

  const today = getTodayDate();

  useEffect(() => {
    async function loadCompletion() {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/habits/${habitId}/completions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load completions.");
        return;
      }

      const completedToday = data.some(
        (completion: { completed_date: string }) =>
          completion.completed_date === today
      );

      setCompleted(completedToday);
    }

    loadCompletion();
  }, [habitId, today]);

  async function toggleCompletion() {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const url = completed
      ? `http://localhost:3000/api/habits/${habitId}/completions/${today}`
      : `http://localhost:3000/api/habits/${habitId}/completions`;

    const response = await fetch(url, {
      method: completed ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: completed
        ? undefined
        : JSON.stringify({
            completedDate: today,
          }),
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
      return;
    }

    if (!response.ok) {
      setMessage(data.message || "Could not update completion.");
      return;
    }

    setCompleted(!completed);
    setMessage("");
    onChanged();
  }

  return (
    <div>
      <button onClick={toggleCompletion}>
        {completed ? "Undo Today" : "Mark Done Today"}
      </button>

      {completed && <span> ✅ Completed today</span>}

      {message && <p>{message}</p>}
    </div>
  );
}