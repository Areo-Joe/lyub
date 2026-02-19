import { useAtom } from "jotai";
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
  type CategoryType,
  type Activity,
} from "@/types";

// Category type colors and labels
const TYPE_CONFIG: Record<CategoryType, { label: string; color: string }> = {
  creative: { label: "Creative Work", color: "#3b82f6" },
  routine: { label: "Routine Tasks", color: "#10b981" },
  rest: { label: "Rest", color: "#6b7280" },
  personal: { label: "Personal", color: "#ec4899" },
};

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

  const todayTotals = calcTotalsByType(todayActivities);
  const weekTotals = calcTotalsByType(weekActivities);

  const todayTotal = Object.values(todayTotals).reduce((a, b) => a + b, 0);
  const weekTotal = Object.values(weekTotals).reduce((a, b) => a + b, 0);

  // Render a stat bar
  const StatBar = ({
    type,
    seconds,
    total,
  }: {
    type: CategoryType;
    seconds: number;
    total: number;
  }) => {
    const config = TYPE_CONFIG[type];
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

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Statistics</h2>
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
            {(Object.keys(TYPE_CONFIG) as CategoryType[]).map((type) => (
              <StatBar key={type} type={type} seconds={todayTotals[type]} total={todayTotal} />
            ))}
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
            {(Object.keys(TYPE_CONFIG) as CategoryType[]).map((type) => (
              <StatBar key={type} type={type} seconds={weekTotals[type]} total={weekTotal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

