import "./index.css";
import { Timer } from "@/components/Timer";

export function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-2xl font-bold">Lyubishchev Time Tracker</h1>
      <Timer />
    </div>
  );
}

export default App;
