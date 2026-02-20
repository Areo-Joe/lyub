import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { timerAtom, categoriesAtom, activitiesAtom } from "@/atoms";
import { formatDate, type Activity } from "@/types";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/CategoryPicker";
import { CategoryManager } from "@/components/CategoryManager";

// Format seconds to HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function Timer() {
  const [timer, setTimer] = useAtom(timerAtom);
  const [categories] = useAtom(categoriesAtom);
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [elapsed, setElapsed] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Calculate elapsed time from startTime
  useEffect(() => {
    if (!timer.isRunning || !timer.startTime) {
      setElapsed(0);
      return;
    }

    setElapsed(Math.floor((Date.now() - timer.startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timer.startTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  const handleStartWithCategory = (categoryId: string) => {
    setTimer({
      ...timer,
      categoryId,
      isRunning: true,
      startTime: Date.now(),
    });
    setPickerOpen(false);
  };

  const handleStop = () => {
    if (!timer.startTime) return;

    if (timer.categoryId) {
      const endTime = Date.now();
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        categoryId: timer.categoryId,
        description: timer.description || "",
        startTime: timer.startTime,
        endTime,
        date: formatDate(new Date(timer.startTime)),
      };
      setActivities([newActivity, ...activities]);
    }

    setTimer({
      ...timer,
      isRunning: false,
      startTime: null,
      description: "",
    });
  };

  const runningCategory = categories.find((c) => c.id === timer.categoryId);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-6xl font-mono tabular-nums">{formatTime(elapsed)}</div>

      {/* Show current category when running */}
      {timer.isRunning && runningCategory && (
        <div className="flex items-center gap-2 text-lg">
          <span
            className="size-4 rounded-full"
            style={{ backgroundColor: runningCategory.color }}
          />
          <span>{runningCategory.name}</span>
        </div>
      )}

      {/* Start/Stop buttons */}
      <div className="flex gap-4 items-center">
        {timer.isRunning ? (
          <Button variant="destructive" size="lg" onClick={handleStop}>
            Stop
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={() => setPickerOpen(true)}>
              Start
            </Button>
            <CategoryManager />
          </>
        )}
      </div>

      <CategoryPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleStartWithCategory}
      />
    </div>
  );
}

