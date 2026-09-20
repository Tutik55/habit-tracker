import { API_URL } from "./config";
import { useEffect, useState } from "react";

type HabitHistoryProps = {
  habitId: number;
  refreshKey: number;
};

type Completion = {
  id: number;
  habit_id: number;
  completed_date: string;
  created_at: string;
};

export default function HabitHistory({
  habitId,
  refreshKey,
}: HabitHistoryProps) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
  `${API_URL}/api/habits/${habitId}/completions`,
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
          setMessage(data.message || "Could not load history.");
          return;
        }

        setCompletions(data);
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to server.");
      }
    }

    loadHistory();
  }, [habitId, refreshKey]);

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="mb-4">
        <h3 className="font-medium text-white">
          Completion History
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Recent completed days.
        </p>
      </div>

      {message && (
        <p className="mb-3 text-sm text-red-400">
          {message}
        </p>
      )}

      {completions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-5 text-sm text-gray-500">
          No completions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {completions.slice(0, 7).map((completion) => (
            <div
              key={completion.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Completed
                  </p>

                  <p className="text-xs text-gray-500">
                    {completion.completed_date}
                  </p>
                </div>
              </div>

              <span className="text-xs text-emerald-400">
                Done
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}