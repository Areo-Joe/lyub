import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { Flame, CalendarCheck, Clock } from "lucide-react";
import {
  activitiesAtom,
  categoriesAtom,
  timeUnitAtom,
  formatDuration,
} from "@/atoms";
import {
  getActivityDuration,
  formatDate,
  calculateStreak,
  CATEGORY_TYPE_CONFIG,
  type CategoryType,
  type Activity,
  type Category,
} from "@/types";
import { Calendar } from "@/components/ui/calendar";

// Intensity levels (in seconds)
const INTENSITY_LEVELS = [
  { min: 0, max: 0, level: 0 },           // No activity
  { min: 1, max: 3600, level: 1 },        // < 1h
  { min: 3600, max: 10800, level: 2 },    // 1-3h
  { min: 10800, max: 21600, level: 3 },   // 3-6h
  { min: 21600, max: Infinity, level: 4 }, // 6h+
];

function getIntensityLevel(seconds: number): number {
  for (const { min, max, level } of INTENSITY_LEVELS) {
    if (seconds >= min && seconds < max) return level;
  }
  return 4;
}

export function StatsCalendar() {
  const [activities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [timeUnit] = useAtom(timeUnitAtom);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date>(new Date());

  // Calculate daily totals: Map<dateString, totalSeconds>
  const dailyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const activity of activities) {
      const current = totals.get(activity.date) || 0;
      totals.set(activity.date, current + getActivityDuration(activity));
    }
    return totals;
  }, [activities]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const monthStartStr = formatDate(monthStart);
    const monthEndStr = formatDate(monthEnd);

    let totalSeconds = 0;
    let daysTracked = 0;

    dailyTotals.forEach((seconds, dateStr) => {
      if (dateStr >= monthStartStr && dateStr <= monthEndStr) {
        totalSeconds += seconds;
        daysTracked++;
      }
    });

    return { totalSeconds, daysTracked };
  }, [dailyTotals, month]);

  // Streak
  const streak = useMemo(() => calculateStreak(activities), [activities]);

  // Group dates by intensity level for modifiers
  const modifiers = useMemo(() => {
    const levels: Record<string, Date[]> = {
      level1: [], level2: [], level3: [], level4: [],
    };

    dailyTotals.forEach((seconds, dateStr) => {
      const level = getIntensityLevel(seconds);
      if (level > 0) {
        const date = new Date(dateStr + "T00:00:00");
        levels[`level${level}`].push(date);
      }
    });

    return levels;
  }, [dailyTotals]);

  // Get selected day's data
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;

    const dateStr = formatDate(selectedDate);
    const dayActivities = activities.filter((a) => a.date === dateStr);

    if (dayActivities.length === 0) return null;

    const byType: Record<CategoryType, number> = {
      creative: 0, routine: 0, rest: 0, personal: 0,
    };
    const byCategory: Record<string, number> = {};

    for (const activity of dayActivities) {
      const cat = categories.find((c) => c.id === activity.categoryId);
      if (cat) byType[cat.type] += getActivityDuration(activity);
      byCategory[activity.categoryId] = (byCategory[activity.categoryId] || 0) + getActivityDuration(activity);
    }

    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    return { byType, byCategory, total, activities: dayActivities };
  }, [selectedDate, activities, categories]);

  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="w-full space-y-4">
      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border p-3 text-center">
          <Clock className="size-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-semibold">{formatDuration(monthlyStats.totalSeconds, timeUnit)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{monthName.split(" ")[0]}</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <CalendarCheck className="size-4 mx-auto text-muted-foreground mb-1" />
          <div className="text-lg font-semibold">{monthlyStats.daysTracked}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Days</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <Flame className="size-4 mx-auto text-orange-500 mb-1" />
          <div className="text-lg font-semibold">{streak}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          modifiers={modifiers}
          modifiersClassNames={{
            level1: "[&_button]:bg-blue-200 [&_button]:dark:bg-blue-900/40 [&_button]:text-blue-900 [&_button]:dark:text-blue-100",
            level2: "[&_button]:bg-blue-300 [&_button]:dark:bg-blue-800/60 [&_button]:text-blue-900 [&_button]:dark:text-blue-100",
            level3: "[&_button]:bg-blue-500 [&_button]:dark:bg-blue-600/80 [&_button]:text-white",
            level4: "[&_button]:bg-blue-700 [&_button]:dark:bg-blue-400 [&_button]:text-white [&_button]:dark:text-blue-950",
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-muted" /> 0
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-blue-200 dark:bg-blue-900/40" /> &lt;1h
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-blue-300 dark:bg-blue-800/60" /> 1-3h
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-blue-500 dark:bg-blue-600/80" /> 3-6h
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded bg-blue-700 dark:bg-blue-400" /> 6h+
        </span>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          data={selectedDayData}
          timeUnit={timeUnit}
          categories={categories}
        />
      )}
    </div>
  );
}

// Day detail panel - shows activities with their times
function DayDetail({
  date,
  data,
  timeUnit,
  categories,
}: {
  date: Date;
  data: {
    byType: Record<CategoryType, number>;
    byCategory: Record<string, number>;
    total: number;
    activities: Activity[];
  } | null;
  timeUnit: "seconds" | "minutes" | "hours";
  categories: Category[];
}) {
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (!data) {
    return (
      <div className="rounded-xl border p-4 text-center text-muted-foreground">
        <p className="font-medium text-foreground">{dateLabel}</p>
        <p className="text-sm mt-1">No activities recorded</p>
      </div>
    );
  }

  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  // Sort activities by start time
  const sortedActivities = [...data.activities].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-muted/30">
        <p className="font-medium">{dateLabel}</p>
        <p className="text-sm font-medium">
          {formatDuration(data.total, timeUnit)}
        </p>
      </div>

      {/* Type breakdown */}
      <div className="p-4 border-b space-y-2">
        {(Object.keys(CATEGORY_TYPE_CONFIG) as CategoryType[]).map((type) => {
          const seconds = data.byType[type];
          if (seconds === 0) return null;
          const config = CATEGORY_TYPE_CONFIG[type];
          const pct = (seconds / data.total) * 100;

          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm flex-1">{config.label}</span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(seconds, timeUnit)}
              </span>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Activity timeline */}
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Activities ({sortedActivities.length})
        </p>
        <div className="space-y-2">
          {sortedActivities.map((activity) => {
            const cat = getCategory(activity.categoryId);
            const startTime = new Date(activity.startTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
            const duration = getActivityDuration(activity);

            return (
              <div key={activity.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-16 text-xs">{startTime}</span>
                <div
                  className="size-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat?.color || "#888" }}
                />
                <span className="flex-1 truncate">{cat?.name || "Unknown"}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDuration(duration, timeUnit)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

