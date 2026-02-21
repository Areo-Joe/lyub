import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import {
  activitiesAtom,
  categoriesAtom,
  timeUnitAtom,
  formatDuration,
} from "@/atoms";
import {
  getActivityDuration,
  formatDate,
  CATEGORY_TYPE_CONFIG,
  type CategoryType,
  type Activity,
  type Category,
} from "@/types";
import { Calendar } from "@/components/ui/calendar";

type GroupBy = "type" | "category";

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

interface StatsCalendarProps {
  groupBy: GroupBy;
}

export function StatsCalendar({ groupBy }: StatsCalendarProps) {
  const [activities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [timeUnit] = useAtom(timeUnitAtom);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Calculate daily totals: Map<dateString, totalSeconds>
  const dailyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const activity of activities) {
      const current = totals.get(activity.date) || 0;
      totals.set(activity.date, current + getActivityDuration(activity));
    }
    return totals;
  }, [activities]);

  // Group dates by intensity level for modifiers
  const modifiers = useMemo(() => {
    const levels: Record<string, Date[]> = {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
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

    // Calculate totals by type
    const byType: Record<CategoryType, number> = {
      creative: 0,
      routine: 0,
      rest: 0,
      personal: 0,
    };

    // Calculate totals by category
    const byCategory: Record<string, number> = {};

    for (const activity of dayActivities) {
      const cat = categories.find((c) => c.id === activity.categoryId);
      if (cat) {
        byType[cat.type] += getActivityDuration(activity);
      }
      // By category
      if (!byCategory[activity.categoryId]) {
        byCategory[activity.categoryId] = 0;
      }
      byCategory[activity.categoryId] += getActivityDuration(activity);
    }

    const total = Object.values(byType).reduce((a, b) => a + b, 0);

    return { byType, byCategory, total, activities: dayActivities };
  }, [selectedDate, activities, categories]);

  return (
    <div className="w-full space-y-4">
      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersClassNames={{
            level1: "bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100",
            level2: "bg-blue-300 dark:bg-blue-800/60 text-blue-900 dark:text-blue-100",
            level3: "bg-blue-500 dark:bg-blue-600/80 text-white",
            level4: "bg-blue-700 dark:bg-blue-400 text-white dark:text-blue-950",
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
          groupBy={groupBy}
          categories={categories}
        />
      )}
    </div>
  );
}

// Day detail panel
function DayDetail({
  date,
  data,
  timeUnit,
  groupBy,
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
  groupBy: GroupBy;
  categories: Category[];
}) {
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!data) {
    return (
      <div className="rounded-lg border p-4 text-center text-muted-foreground">
        <p className="font-medium text-foreground">{dateLabel}</p>
        <p className="text-sm">No activities recorded</p>
      </div>
    );
  }

  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-medium">{dateLabel}</p>
        <p className="text-sm text-muted-foreground">
          Total: {formatDuration(data.total, timeUnit)}
        </p>
      </div>

      <div className="space-y-2">
        {groupBy === "type" ? (
          // By Type
          (Object.keys(CATEGORY_TYPE_CONFIG) as CategoryType[]).map((type) => {
            const seconds = data.byType[type];
            if (seconds === 0) return null;
            const config = CATEGORY_TYPE_CONFIG[type];
            const pct = (seconds / data.total) * 100;

            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{config.label}</span>
                  <span className="text-muted-foreground">
                    {formatDuration(seconds, timeUnit)}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: config.color }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          // By Category
          Object.entries(data.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([catId, seconds]) => {
              const cat = getCategory(catId);
              if (!cat) return null;
              const pct = (seconds / data.total) * 100;

              return (
                <div key={catId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">
                      {formatDuration(seconds, timeUnit)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

