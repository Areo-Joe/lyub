// Activity categories based on Lyubishchev's method
export type CategoryType = "creative" | "routine" | "rest" | "personal";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}

export interface Activity {
  id: string; // Use crypto.randomUUID() when creating
  categoryId: string;
  description: string;
  startTime: number; // timestamp ms
  endTime: number; // timestamp ms
  date: string; // YYYY-MM-DD for easy grouping
}

// Helper to compute duration in minutes
export function getActivityDuration(activity: Activity): number {
  return Math.round((activity.endTime - activity.startTime) / 60000);
}

// Helper to format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Default categories following Lyubishchev's classification
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Writing", type: "creative", color: "#3b82f6" },
  { id: "cat-2", name: "Research", type: "creative", color: "#8b5cf6" },
  { id: "cat-3", name: "Reading", type: "routine", color: "#10b981" },
  { id: "cat-4", name: "Meetings", type: "routine", color: "#f59e0b" },
  { id: "cat-5", name: "Rest", type: "rest", color: "#6b7280" },
  { id: "cat-6", name: "Interests", type: "personal", color: "#ec4899" },
];

