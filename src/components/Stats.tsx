import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { CalendarDays, BarChart3, Flame, Clock, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { StatsCalendar } from "@/components/StatsCalendar";

type StatsView = "overview" | "calendar";
type Period = "today" | "week" | "month";

// Get start of week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get start of month
function getMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get date range for a period
function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      return { start: today, end: now };
    case "week":
      return { start: getWeekStart(today), end: now };
    case "month":
      return { start: getMonthStart(today), end: now };
  }
}

// Get previous period range for comparison
function getPreviousPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case "week": {
      const weekStart = getWeekStart(today);
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekStart);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
      return { start: prevWeekStart, end: prevWeekEnd };
    }
    case "month": {
      const monthStart = getMonthStart(today);
      const prevMonthStart = new Date(monthStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(monthStart);
      prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
      return { start: prevMonthStart, end: prevMonthEnd };
    }
  }
}

export function Stats() {
  const [view, setView] = useState<StatsView>("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [expandedType, setExpandedType] = useState<CategoryType | null>(null);
  const [activities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [timeUnit] = useAtom(timeUnitAtom);

  // Memoize period ranges to avoid recalculating every render
  const periodRange = useMemo(() => getPeriodRange(period), [period]);
  const prevPeriodRange = useMemo(() => getPreviousPeriodRange(period), [period]);

  // Filter activities by date range
  const periodActivities = useMemo(() => {
    const startStr = formatDate(periodRange.start);
    const endStr = formatDate(periodRange.end);
    return activities.filter((a) => a.date >= startStr && a.date <= endStr);
  }, [activities, periodRange]);

  const prevPeriodActivities = useMemo(() => {
    const startStr = formatDate(prevPeriodRange.start);
    const endStr = formatDate(prevPeriodRange.end);
    return activities.filter((a) => a.date >= startStr && a.date <= endStr);
  }, [activities, prevPeriodRange]);

  // Get category type for an activity
  const getCategoryType = (categoryId: string): CategoryType | null => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.type || null;
  };

  // Calculate totals by type
  const calcTotalsByType = (acts: Activity[]) => {
    const totals: Record<CategoryType, number> = {
      creative: 0, routine: 0, rest: 0, personal: 0,
    };
    for (const a of acts) {
      const type = getCategoryType(a.categoryId);
      if (type) totals[type] += getActivityDuration(a);
    }
    return totals;
  };

  // Calculate totals by category
  const calcTotalsByCategory = (acts: Activity[]) => {
    const totals: Record<string, number> = {};
    for (const a of acts) {
      totals[a.categoryId] = (totals[a.categoryId] || 0) + getActivityDuration(a);
    }
    return totals;
  };

  const totalsByType = calcTotalsByType(periodActivities);
  const prevTotalsByType = calcTotalsByType(prevPeriodActivities);
  const totalsByCat = calcTotalsByCategory(periodActivities);

  const totalSeconds = Object.values(totalsByType).reduce((a, b) => a + b, 0);
  const prevTotalSeconds = Object.values(prevTotalsByType).reduce((a, b) => a + b, 0);

  // Streak
  const streak = useMemo(() => calculateStreak(activities), [activities]);

  // Calculate daily totals for trend (last 7 days)
  const dailyTotals = useMemo(() => {
    const last7Days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const dayActs = activities.filter((a) => a.date === dateStr);
      const total = dayActs.reduce((sum, a) => sum + getActivityDuration(a), 0);
      last7Days.push({ date: dateStr, total });
    }
    return last7Days;
  }, [activities]);

  const maxDaily = Math.max(...dailyTotals.map((d) => d.total), 1);

  // Percent change
  const percentChange = prevTotalSeconds > 0
    ? Math.round(((totalSeconds - prevTotalSeconds) / prevTotalSeconds) * 100)
    : totalSeconds > 0 ? 100 : 0;

  // Get categories for a type
  const getCategoriesForType = (type: CategoryType) => {
    return categories.filter((c) => c.type === type);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* View Toggle (Top) */}
      <div className="flex justify-center gap-1">
        <button
          onClick={() => setView("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "overview"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <BarChart3 className="size-4" />
          Overview
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "calendar"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <CalendarDays className="size-4" />
          Calendar
        </button>
      </div>

      {view === "calendar" && <StatsCalendar />}

      {view === "overview" && (
        <>
          {/* Hero Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Time */}
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Clock className="size-3.5" />
                Total Time
              </div>
              <div className="text-2xl font-semibold">
                {formatDuration(totalSeconds, timeUnit)}
              </div>
              {prevTotalSeconds > 0 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  percentChange > 0 ? "text-green-600 dark:text-green-400" :
                  percentChange < 0 ? "text-red-600 dark:text-red-400" :
                  "text-muted-foreground"
                }`}>
                  {percentChange > 0 ? <TrendingUp className="size-3" /> :
                   percentChange < 0 ? <TrendingDown className="size-3" /> :
                   <Minus className="size-3" />}
                  {percentChange > 0 ? "+" : ""}{percentChange}% vs last
                </div>
              )}
            </div>

            {/* Streak */}
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-4 border">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Flame className="size-3.5" />
                Day Streak
              </div>
              <div className="text-2xl font-semibold">
                {streak} <span className="text-base font-normal text-muted-foreground">days</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {streak > 0 ? (<>Keep it up! <Flame className="size-3 text-orange-500" /></>) : "Start tracking!"}
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex justify-center">
            <div className="inline-flex bg-muted rounded-lg p-1">
              {(["today", "week", "month"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  {p === "today" ? "Today" : p === "week" ? "Week" : "Month"}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Trend */}
          <div className="rounded-xl border p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Last 7 Days</h3>
            <div className="flex items-end justify-between gap-1.5">
              {dailyTotals.map((day) => {
                const height = maxDaily > 0 ? (day.total / maxDaily) * 100 : 0;
                const isToday = day.date === formatDate(new Date());
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    {/* Bar container with fixed height */}
                    <div className="h-14 w-full flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isToday ? "bg-primary" : "bg-primary/40"
                        }`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.date}: ${formatDuration(day.total, timeUnit)}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {["S", "M", "T", "W", "T", "F", "S"][new Date(day.date + "T00:00:00").getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown by Type (Drill-down) */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Breakdown</h3>
            {totalSeconds === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activities recorded for this period.
              </p>
            ) : (
              <div className="space-y-2">
                {(Object.keys(CATEGORY_TYPE_CONFIG) as CategoryType[]).map((type) => {
                  const seconds = totalsByType[type];
                  const pct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
                  const config = CATEGORY_TYPE_CONFIG[type];
                  const isExpanded = expandedType === type;
                  const typeCats = getCategoriesForType(type);

                  return (
                    <div key={type} className="rounded-lg border overflow-hidden">
                      {/* Type header - clickable */}
                      <button
                        onClick={() => setExpandedType(isExpanded ? null : type)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(seconds, timeUnit)}
                          </span>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {pct.toFixed(0)}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Progress bar */}
                      <div className="h-1 bg-muted">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: config.color }}
                        />
                      </div>

                      {/* Expanded categories */}
                      {isExpanded && (
                        <div className="bg-muted/30 divide-y divide-border">
                          {typeCats.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-3">
                              No categories of this type
                            </p>
                          ) : (
                            typeCats.map((cat) => {
                              const catSecs = totalsByCat[cat.id] || 0;
                              const catPct = seconds > 0 ? (catSecs / seconds) * 100 : 0;
                              return (
                                <div key={cat.id} className="flex items-center justify-between p-3 pl-8">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="size-2 rounded-full"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="text-sm">{cat.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {formatDuration(catSecs, timeUnit)}
                                    </span>
                                    <span className="text-xs text-muted-foreground w-10 text-right">
                                      {catPct.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

