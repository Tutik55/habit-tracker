import { useEffect, useState } from "react";
import HabitSchedule from "./HabitSchedule";
import HabitCompletion from "./HabitCompletion";
import HabitStats from "./HabitStats";
import HabitHistory from "./HabitHistory";
import HabitCalendar from "./HabitCalendar";
import HabitSummaryCard from "./HabitSummaryCard";


type Habit = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  archived: boolean;
  created_at: string;
};

type DashboardProps = {
  onLogout: () => void;
};

export default function Dashboard({ onLogout }: DashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [message, setMessage] = useState("Loading...");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  const [showCreateHabit, setShowCreateHabit] = useState(false);

  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

const selectedHabit =
  habits.find((habit) => habit.id === selectedHabitId) ??
  habits[0] ??
  null;
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

setSelectedHabitId((currentId) =>
  currentId ?? data[0]?.id ?? null
);

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
      
      if (response.status === 401) {
  localStorage.removeItem("token");
  onLogout();
  return;
}

      if (!response.ok) {
        setMessage(data.message || "Could not create habit.");
        return;
      }

      setHabits((currentHabits) => [...currentHabits, data]);

      setSelectedHabitId(data.id);

      setName("");
      setDescription("");
      setMessage("");
      setShowCreateHabit(false);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  }

  async function handleDeleteHabit(habitId: number) {
    const confirmed = window.confirm(
    "Are you sure you want to delete this habit?"
  );

  if (!confirmed) {
    return;
  }
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

      const remainingHabits = habits.filter(
  (habit) => habit.id !== habitId
);

setHabits(remainingHabits);

if (selectedHabitId === habitId) {
  setSelectedHabitId(remainingHabits[0]?.id ?? null);
}
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  }

async function handleEditHabit(event: React.FormEvent) {
  event.preventDefault();

  if (!selectedHabit) {
    return;
  }

  if (editName.trim() === "") {
    setMessage("Habit name is required.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/habits/${selectedHabit.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      onLogout();
      return;
    }

    if (!response.ok) {
      setMessage(data.message || "Could not update habit.");
      return;
    }

    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === selectedHabit.id ? data : habit
      )
    );

    setShowEditHabit(false);
    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Could not connect to server.");
  }
}

     return (
  <div className="min-h-screen bg-[#0f0f0f] text-white">
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="hidden w-20 border-r border-white/10 bg-[#121212] md:flex md:flex-col md:items-center md:py-6">
        <div className="mb-10 text-xl font-bold text-blue-500">
          H
        </div>

        <div className="flex flex-1 flex-col gap-6 text-xl text-gray-500">
          <button className="rounded-xl bg-blue-600/20 p-3 text-blue-400">
            ◫
          </button>

          <button className="p-3 hover:text-white">
            ◷
          </button>

          <button className="p-3 hover:text-white">
            ▥
          </button>

          <button className="p-3 hover:text-white">
            ☰
          </button>

          <button className="p-3 hover:text-white">
            ⚙
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-8 lg:px-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Zdravo 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Nastavi graditi svoje navike.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
              🔥 Keep going
            </div>

             <button
  onClick={() => setShowCreateHabit(true)}
  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
>
  + New Habit
</button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                onLogout();
              }}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Create habit */}
        {showCreateHabit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Create Habit
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a new habit to track.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateHabit(false)}
          className="text-xl text-gray-500 hover:text-white"
        >
          ×
        </button>
      </div>

      <form
        onSubmit={handleCreateHabit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Habit name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowCreateHabit(false)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Create Habit
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit habit */}
{showEditHabit && selectedHabit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Edit Habit
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your habit details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEditHabit(false)}
          className="text-xl text-gray-500 hover:text-white"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleEditHabit} className="space-y-4">
        <input
          type="text"
          placeholder="Habit name"
          value={editName}
          onChange={(event) => setEditName(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
        />

        <input
          type="text"
          placeholder="Description"
          value={editDescription}
          onChange={(event) => setEditDescription(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowEditHabit(false)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {message && (
          <p className="mb-6 text-sm text-gray-400">
            {message}
          </p>
        )}

       
        {/* Habit summary cards / Empty state */}
{habits.length === 0 ? (
  <div className="mb-6 rounded-2xl border border-dashed border-white/10 bg-[#171717] p-10 text-center">
    <p className="text-lg font-medium text-white">
      No habits yet
    </p>

    <p className="mt-2 text-sm text-gray-500">
      Create your first habit and start tracking your progress.
    </p>

    <button
      onClick={() => setShowCreateHabit(true)}
      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
    >
      + Create your first habit
    </button>
  </div>
) : (
  <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {habits.map((habit) => (
      <HabitSummaryCard
        key={habit.id}
        habitId={habit.id}
        name={habit.name}
        selected={selectedHabit?.id === habit.id}
        refreshKey={refreshKey}
        onClick={() => setSelectedHabitId(habit.id)}
      />
    ))}
  </div>
)}

        {/* Selected habit */}
        {selectedHabit && (
          <section className="rounded-2xl border border-white/10 bg-[#171717] p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Active habit
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedHabit.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedHabit.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
  setEditName(selectedHabit.name);
  setEditDescription(selectedHabit.description ?? "");
  setShowEditHabit(true);
}}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteHabit(selectedHabit.id)}
                  className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <HabitCalendar
                habitId={selectedHabit.id}
                refreshKey={refreshKey}
              />
              <HabitSchedule habitId={selectedHabit.id}
              
  onChanged={() =>
    setRefreshKey((current) => current + 1)
  }
              />

              <HabitCompletion
                habitId={selectedHabit.id}
                onChanged={() =>
                  setRefreshKey((current) => current + 1)
                }
              />

              <HabitStats
                habitId={selectedHabit.id}
                refreshKey={refreshKey}
              />

              <HabitHistory
                habitId={selectedHabit.id}
                refreshKey={refreshKey}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  </div>
);
}