import { useState } from "react";
import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import { categoriesAtom } from "@/atoms";
import { type Category, type CategoryType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm, PRESET_COLORS } from "@/components/CategoryForm";

interface CategoryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (categoryId: string) => void;
}

export function CategoryPicker({ open, onOpenChange, onSelect }: CategoryPickerProps) {
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "routine" as CategoryType,
    color: PRESET_COLORS[0],
  });

  const resetForm = () => {
    setFormData({ name: "", type: "routine", color: PRESET_COLORS[0] });
    setShowAddForm(false);
  };

  const handleAddCategory = () => {
    if (!formData.name.trim()) return;

    const newCategory: Category = {
      id: `cat-${crypto.randomUUID()}`,
      name: formData.name,
      type: formData.type,
      color: formData.color,
    };
    setCategories([...categories, newCategory]);
    resetForm();
    onSelect(newCategory.id);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{showAddForm ? "Add Category" : "Pick a Category"}</DialogTitle>
        </DialogHeader>

        {!showAddForm ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <span
                  className="size-5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-left font-medium truncate">{cat.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{cat.type}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed hover:bg-accent transition-colors text-muted-foreground"
            >
              <Plus className="size-5" />
              <span>Add new category</span>
            </button>
          </div>
        ) : (
          <CategoryForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleAddCategory}
            submitLabel="Add & Start"
            onCancel={resetForm}
            cancelLabel="Back"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

