import { useEffect, useState } from "react";

type HabitScheduleProps = {
  habitId: number;
   onChanged: () => void;
};

const days = [
  { id: 1, short: "Mon" },
  { id: 2, short: "Tue" },
  { id: 3, short: "Wed" },
  { id: 4, short: "Thu" },
  { id: 5, short: "Fri" },
  { id: 6, short: "Sat" },
  { id: 7, short: "Sun" },
];

export default function HabitSchedule({
  habitId,onChanged,
}: HabitScheduleProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/habits/${habitId}/schedule`,
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

      if (response.ok) {
        setSelectedDays(data.days);
      }
    }

    loadSchedule();
  }, [habitId]);

  function toggleDay(dayId: number) {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(dayId)) {
        return currentDays.filter((day) => day !== dayId);
      }

      return [...currentDays, dayId];
    });

    setMessage("");
  }

  async function saveSchedule() {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/habits/${habitId}/schedule`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: selectedDays,
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
      return;
    }

    if (!response.ok) {
      setMessage(data.message || "Could not save schedule.");
      return;
    }

    setMessage("Schedule saved");
    onChanged();
  }

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white">
            Schedule
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Select the days for this habit.
          </p>
        </div>

        <button
          onClick={saveSchedule}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Save
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const selected = selectedDays.includes(day.id);

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={`rounded-xl border px-3 py-3 text-sm transition ${
                selected
                  ? "border-blue-500 bg-blue-500/15 text-blue-400"
                  : "border-white/10 bg-[#101010] text-gray-500 hover:border-white/20 hover:text-gray-300"
              }`}
            >
              {day.short}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="mt-3 text-sm text-emerald-400">
          ✓ {message}
        </p>
      )}
    </div>
  );
}