import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { timerAtom } from "@/atoms";
import { Button } from "@/components/ui/button";

// Format seconds to HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function Timer() {
  const [timer, setTimer] = useAtom(timerAtom);
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

  const handleStart = () => {
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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-6xl font-mono tabular-nums">{formatTime(elapsed)}</div>
      <div className="flex gap-4">
        {timer.isRunning ? (
          <Button variant="destructive" size="lg" onClick={handleStop}>
            Stop
          </Button>
        ) : (
          <Button size="lg" onClick={handleStart}>
            Start
          </Button>
        )}
      </div>
    </div>
  );
}

