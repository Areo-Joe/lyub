import { useState } from "react";
import { useAtom } from "jotai";
import { Settings, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { HexColorPicker } from "react-colorful";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CATEGORY_TYPES: { value: CategoryType; label: string }[] = [
  { value: "creative", label: "Creative" },
  { value: "routine", label: "Routine" },
  { value: "rest", label: "Rest" },
  { value: "personal", label: "Personal" },
];

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#6b7280", "#ec4899", "#ef4444", "#06b6d4",
];

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
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v: CategoryType) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`size-6 rounded-full border-2 ${formData.color === color ? "border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="size-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground"
                    style={!PRESET_COLORS.includes(formData.color) ? { backgroundColor: formData.color, borderStyle: "solid", borderColor: "currentColor" } : {}}
                  >
                    {PRESET_COLORS.includes(formData.color) && <Plus className="size-3" />}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <HexColorPicker color={formData.color} onChange={(color) => setFormData({ ...formData, color })} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Plus className="size-4 mr-1" />
              {editingCategory ? "Update" : "Add"} Category
            </Button>
            <Button
              variant="outline"
              onClick={() => setCategories(DEFAULT_CATEGORIES)}
              disabled={timer.isRunning && !DEFAULT_CATEGORIES.some((c) => c.id === timer.categoryId)}
              title={timer.isRunning && !DEFAULT_CATEGORIES.some((c) => c.id === timer.categoryId) ? "Cannot reset: running category would be deleted" : "Reset to defaults"}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

