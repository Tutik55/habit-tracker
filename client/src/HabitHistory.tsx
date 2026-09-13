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
  habitId,refreshKey
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
  }, [habitId,refreshKey]);

  return (
    <div>
      <h3>Completion History</h3>

      {message && <p>{message}</p>}

      {completions.length === 0 ? (
        <p>No completions yet.</p>
      ) : (
        <ul>
          {completions.map((completion) => (
            <li key={completion.id}>
              ✅ {completion.completed_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}