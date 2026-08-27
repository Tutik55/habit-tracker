import { useEffect, useState } from "react";

type Habit = {
  id: number;
  name: string;
  completed: boolean;
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/habits")
      .then((response) => response.json())
      .then((data) => {
        setHabits(data);
      });
  }, []);

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-5xl font-bold">Habit Tracker</h1>

      <div className="mt-8">
        {habits.map((habit) => (
          <div key={habit.id} className="mb-4">
            {habit.completed ? "✅" : "⬜"} {habit.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;