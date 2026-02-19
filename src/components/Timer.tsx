import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { timerAtom, categoriesAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time from startTime
  useEffect(() => {
    if (!timer.isRunning || !timer.startTime) {
      setElapsed(0);
      return;
    }

    // Initial calculation
    setElapsed(Math.floor((Date.now() - timer.startTime) / 1000));

    // Update every second
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timer.startTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  const handleCategoryChange = (categoryId: string) => {
    setTimer({ ...timer, categoryId });
  };

  const handleStart = () => {
    if (!timer.categoryId) return; // Require category
    setTimer({
      ...timer,
      isRunning: true,
      startTime: Date.now(),
    });
  };

  const handleStop = () => {
    setTimer({
      ...timer,
      isRunning: false,
      startTime: null,
    });
    // TODO: Save activity
  };

  const selectedCategory = categories.find((c) => c.id === timer.categoryId);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-6xl font-mono tabular-nums">{formatTime(elapsed)}</div>

      {/* Category selector with settings */}
      <div className="flex items-center gap-2">
        <Select
          value={timer.categoryId || ""}
          onValueChange={handleCategoryChange}
          disabled={timer.isRunning}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category">
              {selectedCategory && (
                <span className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  {selectedCategory.name}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CategoryManager />
      </div>

      {/* Start/Stop buttons */}
      <div className="flex gap-4">
        {timer.isRunning ? (
          <Button variant="destructive" size="lg" onClick={handleStop}>
            Stop
          </Button>
        ) : (
          <Button size="lg" onClick={handleStart} disabled={!timer.categoryId}>
            Start
          </Button>
        )}
      </div>
    </div>
  );
}

