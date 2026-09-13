import { useEffect, useState } from "react";

type Habit = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  archived: boolean;
  created_at: string;
};

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [message, setMessage] = useState("Loading...");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadHabits() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You are not logged in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/habits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Could not load habits.");
          return;
        }

        setHabits(data);
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to server.");
      }
    }

    loadHabits();
  }, []);

  async function handleCreateHabit(event: React.FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not create habit.");
        return;
      }

      setHabits((currentHabits) => [...currentHabits, data]);

      setName("");
      setDescription("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  }

  async function handleDeleteHabit(habitId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/habits/${habitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        const data = await response.json();
      
      if (!response.ok) {
        
        setMessage(data.message || "Could not delete habit.");
        return;
      }

      setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  }

async function handleEditHabit(habit: Habit){
    const newName = window.prompt("New habit name:", habit.name);

  if (newName === null || newName.trim() === "") {
    return;
  }

  const newDescription = window.prompt(
    "New description:",
    habit.description ?? ""
  );

  if (newDescription === null) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/habits/${habit.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Could not update habit.");
      return;
    }

    setHabits((currentHabits) =>
      currentHabits.map((currentHabit) =>
        currentHabit.id === habit.id ? data : currentHabit
      )
    );

    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Could not connect to server.");
  }
}

  return (
    <div>
      <h1>My Habits</h1>

      <form onSubmit={handleCreateHabit}>
        <input
          type="text"
          placeholder="Habit name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <button type="submit">
          Add Habit
        </button>
      </form>

      {message && <p>{message}</p>}

      {habits.map((habit) => (
        <div key={habit.id}>
          <h2>{habit.name}</h2>
          <p>{habit.description}</p>

          <button onClick={() => handleEditHabit(habit)}>
            Edit
          </button>

          <button onClick={() => handleDeleteHabit(habit.id)}>
            Delete
            </button>
        </div>
      ))}
    </div>
  );
}