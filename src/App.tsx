import { useState } from "react";
import "./index.css";
import { Timer } from "@/components/Timer";
import { ActivityHistory } from "@/components/ActivityHistory";
import { Stats } from "@/components/Stats";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("timer");

  return (
    <ThemeProvider>
      <div className="flex flex-col items-center min-h-screen pb-20">
        {/* Header */}
        <header className="w-full py-3 px-4 border-b bg-background sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Lyubishchev</h1>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full max-w-md px-4 py-6">
          {activeTab === "timer" && <Timer />}
          {activeTab === "history" && <ActivityHistory />}
          {activeTab === "stats" && <Stats />}
        </main>

        {/* Bottom navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ThemeProvider>
  );
}

export default App;
