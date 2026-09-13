import { useEffect, useState } from "react";

type HabitScheduleProps = {
  habitId: number;
};

const days = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

export default function HabitSchedule({
  habitId,
}: HabitScheduleProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      const token = localStorage.getItem("token");

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
  }

  async function saveSchedule() {
    const token = localStorage.getItem("token");

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

    setMessage("Schedule saved!");
  }

  return (
    <div>
      <h3>Schedule</h3>

      {days.map((day) => (
        <label key={day.id}>
          <input
            type="checkbox"
            checked={selectedDays.includes(day.id)}
            onChange={() => toggleDay(day.id)}
          />

          {day.name}
        </label>
      ))}

      <button onClick={saveSchedule}>
        Save Schedule
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}