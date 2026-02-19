import { atomWithStorage } from "jotai/utils";
import type { Activity } from "@/types";

// Persisted to localStorage
export const activitiesAtom = atomWithStorage<Activity[]>("lyub-activities", []);

