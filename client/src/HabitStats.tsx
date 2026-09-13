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

export default function HabitStats({
  habitId,
  refreshKey,
}: HabitStatsProps) {
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
    return <p className="text-sm text-red-400">{message}</p>;
  }

  if (!stats) {
    return <p className="text-sm text-gray-500">Loading statistics...</p>;
  }

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="mb-4">
        <h3 className="font-medium text-white">
          Statistics
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Your progress for this habit.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-4">
          <p className="text-sm text-gray-500">
            Current streak
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            🔥 {stats.currentStreak}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-4">
          <p className="text-sm text-gray-500">
            Best streak
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            🏆 {stats.bestStreak}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-4">
          <p className="text-sm text-gray-500">
            Success rate
          </p>

          <p className="mt-2 text-2xl font-semibold text-blue-400">
            {stats.successPercentage}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">
            Completed scheduled days
          </span>

          <span className="text-gray-300">
            {stats.completedScheduledDays} / {stats.totalScheduledDays}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${stats.successPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}