import { useEffect, useState } from "react";

type HabitCalendarProps = {
  habitId: number;
  refreshKey: number;
};

type Completion = {
  completed_date: string;
};

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function HabitCalendar({
  habitId,
  refreshKey,
}: HabitCalendarProps) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  useEffect(() => {
    async function loadCalendarData() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const [scheduleResponse, completionsResponse] = await Promise.all([
          fetch(
            `http://localhost:3000/api/habits/${habitId}/schedule`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:3000/api/habits/${habitId}/completions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        if (
          scheduleResponse.status === 401 ||
          completionsResponse.status === 401
        ) {
          localStorage.removeItem("token");
          window.location.reload();
          return;
        }

        const scheduleData = await scheduleResponse.json();
        const completionsData = await completionsResponse.json();

        if (scheduleResponse.ok) {
          setScheduleDays(scheduleData.days);
        }

        if (completionsResponse.ok) {
          setCompletedDates(
            completionsData.map(
              (completion: Completion) => completion.completed_date
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadCalendarData();
  }, [habitId, refreshKey]);

  function previousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  }

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  // Pretvaramo JS Sunday=0 u calendar gdje Monday počinje prvi.
  const startingOffset = firstDay === 0 ? 6 : firstDay - 1;

  const monthName = new Date(
    currentYear,
    currentMonth
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const todayString = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium text-white">
            Calendar
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Monthly habit activity.
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <button
            onClick={previousMonth}
            className="rounded-lg border border-white/10 px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ←
          </button>

          <p className="min-w-0 text-center text-xs font-medium sm:min-w-36 sm:text-sm">
            {monthName}
          </p>

          <button
            onClick={nextMonth}
            className="rounded-lg border border-white/10 px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (day) => (
            <div
              key={day}
              className="pb-2 text-center text-xs text-gray-600"
            >
              {day}
            </div>
          )
        )}

        {Array.from({ length: startingOffset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;

          const date = new Date(
            currentYear,
            currentMonth,
            day
          );

          const dateString = formatDate(
            currentYear,
            currentMonth,
            day
          );

          const jsDay = date.getDay();
          const dayOfWeek = jsDay === 0 ? 7 : jsDay;

          const isScheduled = scheduleDays.includes(dayOfWeek);
          const isCompleted = completedDates.includes(dateString);
          const isToday = dateString === todayString;
          const isPast = dateString < todayString;

          let dayStyle =
            "border-white/5 bg-[#101010] text-gray-600";

          if (isScheduled) {
            dayStyle =
              "border-blue-500/20 bg-blue-500/5 text-gray-300";
          }

          if (isScheduled && isPast && !isCompleted) {
            dayStyle =
              "border-red-500/20 bg-red-500/5 text-red-400";
          }

          if (isCompleted) {
            dayStyle =
              "border-blue-500 bg-blue-500 text-white";
          }

          return (
            <div
              key={day}
              className={`relative flex aspect-square items-center justify-center rounded-xl border text-sm transition ${dayStyle}`}
            >
              {day}

              {isToday && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-500" />
          Completed
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-red-500/30 bg-red-500/10" />
          Missed
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-blue-500/30 bg-blue-500/10" />
          Scheduled
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-white/10 bg-[#101010]" />
          Not scheduled
        </div>
      </div>
    </div>
  );
}