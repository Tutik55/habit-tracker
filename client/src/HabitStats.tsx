import { useEffect, useState } from "react";

type HabitStatsProps = {
  habitId: number;
  refreshKey: number;
};

type Stats = {
  habitId: number;
  currentStreak: number;
  bestStreak: number;
  successPercentage: number;
  completedScheduledDays: number;
  totalScheduledDays: number;
};

export default function HabitStats({ habitId, refreshKey }: HabitStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadStats() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/habits/${habitId}/stats`,
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
          setMessage(data.message || "Could not load statistics.");
          return;
        }

        setStats(data);
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to server.");
      }
    }

    loadStats();
  }, [habitId, refreshKey]);

  if (message) {
    return <p>{message}</p>;
  }

  if (!stats) {
    return <p>Loading statistics...</p>;
  }

  return (
    <div>
      <h3>Statistics</h3>

      <p>🔥 Current streak: {stats.currentStreak}</p>
      <p>🏆 Best streak: {stats.bestStreak}</p>
      <p>📊 Success: {stats.successPercentage}%</p>

      <p>
        Completed: {stats.completedScheduledDays} /{" "}
        {stats.totalScheduledDays} scheduled days
      </p>
    </div>
  );
}