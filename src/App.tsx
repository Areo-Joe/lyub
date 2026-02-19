import { useState } from "react";
import "./index.css";
import { Timer } from "@/components/Timer";
import { ActivityHistory } from "@/components/ActivityHistory";
import { BottomNav, type TabId } from "@/components/BottomNav";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("timer");

  return (
    <div className="flex flex-col items-center min-h-screen pb-20">
      {/* Header */}
      <header className="w-full py-4 text-center border-b bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold">Lyubishchev</h1>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-md px-4 py-6">
        {activeTab === "timer" && <Timer />}
        {activeTab === "history" && <ActivityHistory />}
        {activeTab === "stats" && (
          <div className="text-center text-muted-foreground py-12">
            Stats coming soon...
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
