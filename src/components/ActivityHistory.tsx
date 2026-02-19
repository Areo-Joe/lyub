import { useAtom } from "jotai";
import { activitiesAtom, categoriesAtom } from "@/atoms";
import { getActivityDuration, type Activity } from "@/types";

// Format time as HH:MM
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Format duration in minutes to readable string
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Format date for display
function formatDisplayDate(dateStr: string): string {
  const today = new Date();
  const date = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86400000);
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// Group activities by date
function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = groups.get(activity.date) || [];
    groups.set(activity.date, [...existing, activity]);
  }
  return groups;
}

export function ActivityHistory() {
  const [activities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const grouped = groupByDate(activities);

  if (activities.length === 0) {
    return (
      <div className="w-full max-w-md text-center text-muted-foreground py-8">
        No activities yet. Start the timer to track your time!
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-lg font-semibold">Activity History</h2>
      
      {Array.from(grouped.entries()).map(([date, dateActivities]) => {
        const totalMinutes = dateActivities.reduce(
          (sum, a) => sum + getActivityDuration(a),
          0
        );

        return (
          <div key={date} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{formatDisplayDate(date)}</span>
              <span className="text-muted-foreground">
                Total: {formatDuration(totalMinutes)}
              </span>
            </div>

            <div className="space-y-1">
              {dateActivities.map((activity) => {
                const category = getCategoryById(activity.categoryId);
                const duration = getActivityDuration(activity);

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded border bg-card"
                  >
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: category?.color || "#888" }}
                    />
                    <span className="flex-1 truncate">
                      {category?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                    </span>
                    <span className="text-sm font-medium w-12 text-right">
                      {formatDuration(duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

