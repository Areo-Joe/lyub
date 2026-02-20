import { useAtom } from "jotai";
import { Trash2 } from "lucide-react";
import {
  activitiesAtom,
  categoriesAtom,
  timeUnitAtom,
  TIME_UNIT_OPTIONS,
  formatDuration,
} from "@/atoms";
import { getActivityDuration, type Activity } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Format time as HH:MM
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [categories] = useAtom(categoriesAtom);
  const [timeUnit, setTimeUnit] = useAtom(timeUnitAtom);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const handleDelete = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const handleClearAll = () => {
    setActivities([]);
  };
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Activity History</h2>
        <div className="flex items-center gap-2">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {activities.length} activities. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {Array.from(grouped.entries()).map(([date, dateActivities]) => {
        const totalSeconds = dateActivities.reduce(
          (sum, a) => sum + getActivityDuration(a),
          0
        );

        return (
          <div key={date} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{formatDisplayDate(date)}</span>
              <span className="text-muted-foreground">
                Total: {formatDuration(totalSeconds, timeUnit)}
              </span>
            </div>

            <div className="space-y-1">
              {dateActivities.map((activity) => {
                const category = getCategoryById(activity.categoryId);
                const durationSecs = getActivityDuration(activity);

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded border bg-card"
                  >
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: category?.color || "#888" }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">
                        {category?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {category?.type || "unknown"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                    </span>
                    <span className="text-sm font-medium w-14 text-right">
                      {formatDuration(durationSecs, timeUnit)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(activity.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
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

