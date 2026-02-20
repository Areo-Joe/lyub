import { useState } from "react";
import { useAtom } from "jotai";
import { Settings, Pencil, Trash2, RotateCcw } from "lucide-react";
import { categoriesAtom, timerAtom } from "@/atoms";
import { type Category, type CategoryType, DEFAULT_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm, PRESET_COLORS } from "@/components/CategoryForm";

export function CategoryManager() {
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [timer, setTimer] = useAtom(timerAtom);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "routine" as CategoryType,
    color: PRESET_COLORS[0],
  });

  const resetForm = () => {
    setFormData({ name: "", type: "routine", color: PRESET_COLORS[0] });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type, color: category.color });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Update existing
      setCategories(categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: formData.name, type: formData.type, color: formData.color }
          : c
      ));
    } else {
      // Add new
      const newCategory: Category = {
        id: `cat-${crypto.randomUUID()}`,
        name: formData.name,
        type: formData.type,
        color: formData.color,
      };
      setCategories([...categories, newCategory]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    // Clear timer selection if deleted category was selected
    if (timer.categoryId === id) {
      setTimer({ ...timer, categoryId: undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        {/* Category list */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((cat) => {
            const isRunning = timer.isRunning && timer.categoryId === cat.id;
            return (
              <div key={cat.id} className="flex items-center gap-2 p-2 rounded border">
                <span className="size-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="flex-1">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.type}</span>
                {isRunning && (
                  <span className="text-xs text-primary animate-pulse">●</span>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(cat)}>
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(cat.id)}
                  disabled={isRunning}
                  title={isRunning ? "Cannot delete while timer is running" : undefined}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add/Edit form */}
        <div className="pt-4 border-t">
          <CategoryForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            submitLabel={editingCategory ? "Update Category" : "Add Category"}
          />
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategories(DEFAULT_CATEGORIES)}
              disabled={timer.isRunning && !DEFAULT_CATEGORIES.some((c) => c.id === timer.categoryId)}
              title={timer.isRunning && !DEFAULT_CATEGORIES.some((c) => c.id === timer.categoryId) ? "Cannot reset: running category would be deleted" : "Reset to defaults"}
            >
              <RotateCcw className="size-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

