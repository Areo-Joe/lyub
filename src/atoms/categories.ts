import { atomWithStorage } from "jotai/utils";
import { DEFAULT_CATEGORIES, type Category } from "@/types";

// Persisted to localStorage
export const categoriesAtom = atomWithStorage<Category[]>("lyub-categories", DEFAULT_CATEGORIES);

