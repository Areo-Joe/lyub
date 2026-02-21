import { useState } from "react";
import { useAtom } from "jotai";
import { CalendarDays, BarChart3 } from "lucide-react";
import {
  activitiesAtom,
  categoriesAtom,
  timeUnitAtom,
  TIME_UNIT_OPTIONS,
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
import { StatsCalendar } from "@/components/StatsCalendar";

type StatsView = "summary" | "calendar";
type GroupBy = "type" | "category";

// Get start of week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function Stats() {
  const [view, setView] = useState<StatsView>("summary");
  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const [activities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [timeUnit, setTimeUnit] = useAtom(timeUnitAtom);

  const today = formatDate(new Date());
  const weekStart = getWeekStart(new Date());

  // Get category type for an activity
  const getCategoryType = (categoryId: string): CategoryType | null => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.type || null;
  };

  // Filter activities for today
  const todayActivities = activities.filter((a) => a.date === today);

  // Filter activities for this week
  const weekActivities = activities.filter((a) => {
    const actDate = new Date(a.date + "T00:00:00");
    return actDate >= weekStart;
  });

  // Calculate totals by type
  const calcTotalsByType = (acts: Activity[]) => {
    const totals: Record<CategoryType, number> = {
      creative: 0,
      routine: 0,
      rest: 0,
      personal: 0,
    };
    for (const a of acts) {
      const type = getCategoryType(a.categoryId);
      if (type) {
        totals[type] += getActivityDuration(a);
      }
    }
    return totals;
  };

  // Calculate totals by category
  const calcTotalsByCategory = (acts: Activity[]) => {
    const totals: Record<string, number> = {};
    for (const a of acts) {
      if (!totals[a.categoryId]) {
        totals[a.categoryId] = 0;
      }
      totals[a.categoryId] += getActivityDuration(a);
    }
    return totals;
  };

  // Get category by id
  const getCategory = (categoryId: string): Category | undefined => {
    return categories.find((c) => c.id === categoryId);
  };

  const todayTotalsByType = calcTotalsByType(todayActivities);
  const weekTotalsByType = calcTotalsByType(weekActivities);
  const todayTotalsByCat = calcTotalsByCategory(todayActivities);
  const weekTotalsByCat = calcTotalsByCategory(weekActivities);

  const todayTotal = Object.values(todayTotalsByType).reduce((a, b) => a + b, 0);
  const weekTotal = Object.values(weekTotalsByType).reduce((a, b) => a + b, 0);

  // Render a stat bar for type
  const TypeStatBar = ({
    type,
    seconds,
    total,
  }: {
    type: CategoryType;
    seconds: number;
    total: number;
  }) => {
    const config = CATEGORY_TYPE_CONFIG[type];
    const pct = total > 0 ? (seconds / total) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{config.label}</span>
          <span className="text-muted-foreground">{formatDuration(seconds, timeUnit)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: config.color }}
          />
        </div>
      </div>
    );
  };

  // Render a stat bar for category
  const CategoryStatBar = ({
    categoryId,
    seconds,
    total,
  }: {
    categoryId: string;
    seconds: number;
    total: number;
  }) => {
    const cat = getCategory(categoryId);
    if (!cat) return null;
    const pct = total > 0 ? (seconds / total) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{cat.name}</span>
          <span className="text-muted-foreground">{formatDuration(seconds, timeUnit)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: cat.color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header with view toggle, group by, and time unit */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        {/* View toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setView("summary")}
            className={`p-2 rounded transition-colors ${
              view === "summary"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            title="Summary"
          >
            <BarChart3 className="size-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`p-2 rounded transition-colors ${
              view === "calendar"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            title="Calendar"
          >
            <CalendarDays className="size-4" />
          </button>
        </div>

        {/* Group by toggle */}
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setGroupBy("type")}
            className={`px-2 py-1 rounded transition-colors ${
              groupBy === "type"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setGroupBy("category")}
            className={`px-2 py-1 rounded transition-colors ${
              groupBy === "category"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            By Category
          </button>
        </div>

        {/* Time unit selector */}
        <div className="flex gap-1 text-xs">
          {TIME_UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeUnit(opt.value)}
              className={`px-2 py-1 rounded transition-colors ${
                timeUnit === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar view */}
      {view === "calendar" && <StatsCalendar groupBy={groupBy} />}

      {/* Summary view */}
      {view === "summary" && (
        <>
          {/* Today */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Today</h3>
              <span className="text-sm text-muted-foreground">
                Total: {formatDuration(todayTotal, timeUnit)}
              </span>
            </div>
            {todayTotal === 0 ? (
              <p className="text-muted-foreground text-sm">No activities recorded today.</p>
            ) : (
              <div className="space-y-3">
                {groupBy === "type" ? (
                  (Object.keys(CATEGORY_TYPE_CONFIG) as CategoryType[]).map((type) => (
                    <TypeStatBar key={type} type={type} seconds={todayTotalsByType[type]} total={todayTotal} />
                  ))
                ) : (
                  Object.entries(todayTotalsByCat)
                    .sort(([, a], [, b]) => b - a)
                    .map(([catId, seconds]) => (
                      <CategoryStatBar key={catId} categoryId={catId} seconds={seconds} total={todayTotal} />
                    ))
                )}
              </div>
            )}
          </section>

          {/* This Week */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">This Week</h3>
              <span className="text-sm text-muted-foreground">
                Total: {formatDuration(weekTotal, timeUnit)}
              </span>
            </div>
            {weekTotal === 0 ? (
              <p className="text-muted-foreground text-sm">No activities this week.</p>
            ) : (
              <div className="space-y-3">
                {groupBy === "type" ? (
                  (Object.keys(CATEGORY_TYPE_CONFIG) as CategoryType[]).map((type) => (
                    <TypeStatBar key={type} type={type} seconds={weekTotalsByType[type]} total={weekTotal} />
                  ))
                ) : (
                  Object.entries(weekTotalsByCat)
                    .sort(([, a], [, b]) => b - a)
                    .map(([catId, seconds]) => (
                      <CategoryStatBar key={catId} categoryId={catId} seconds={seconds} total={weekTotal} />
                    ))
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

