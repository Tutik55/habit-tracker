import { API_URL } from "./config";
import { useEffect, useState } from "react";

type HabitSummaryCardProps = {
  habitId: number;
  name: string;
  selected: boolean;
  refreshKey: number;
  onClick: () => void;
};

type Stats = {
  currentStreak: number;
  bestStreak: number;
  successPercentage: number;
};

export default function HabitSummaryCard({
  habitId,
  name,
  selected,
  refreshKey,
  onClick,
}: HabitSummaryCardProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
  `${API_URL}/api/habits/${habitId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setStats(data);
    }

    loadStats();
  }, [habitId, refreshKey]);

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 bg-[#171717] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {name}
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            {stats ? `${stats.successPercentage}%` : "..."}
          </p>
        </div>

        <div className="text-lg">
          🔥
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${stats?.successPercentage ?? 0}%`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>
          Current: {stats?.currentStreak ?? 0}
        </span>

        <span>
          Best: {stats?.bestStreak ?? 0}
        </span>
      </div>
    </button>
  );
}