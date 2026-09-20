import { API_URL } from "./config";

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

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/api/habits/${habitId}/completions`,
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
      ? `${API_URL}/api/habits/${habitId}/completions/${today}`
      : `${API_URL}/api/habits/${habitId}/completions`;

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
    <div className="border-t border-white/10 pt-6">
      <div className="mb-4">
        <h3 className="font-medium text-white">
          Today
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {today}
        </p>
      </div>

      <button
        onClick={toggleCompletion}
        className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
          completed
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-white/10 bg-[#101010] hover:border-blue-500/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">
              {completed ? "Completed today" : "Mark as completed"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {completed
                ? "Great work. Keep the streak going."
                : "Finish today's habit and mark it done."}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              completed
                ? "bg-emerald-500 text-white"
                : "bg-white/5 text-gray-500"
            }`}
          >
            {completed ? "✓" : "○"}
          </div>
        </div>
      </button>

      {message && (
        <p className="mt-3 text-sm text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}