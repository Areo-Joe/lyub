import { Plus } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { type CategoryType } from "@/types";
import { Button } from "@/components/ui/button";
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

export const CATEGORY_TYPES: { value: CategoryType; label: string }[] = [
  { value: "creative", label: "Creative" },
  { value: "routine", label: "Routine" },
  { value: "rest", label: "Rest" },
  { value: "personal", label: "Personal" },
];

export const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#6b7280", "#ec4899", "#ef4444", "#06b6d4",
];

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  color: string;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  onChange: (data: CategoryFormData) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function CategoryForm({
  formData,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  cancelLabel,
}: CategoryFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Category name"
          />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v: CategoryType) => onChange({ ...formData, type: v })}
          >
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
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`size-6 rounded-full border-2 ${formData.color === color ? "border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ ...formData, color })}
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
              <HexColorPicker color={formData.color} onChange={(color) => onChange({ ...formData, color })} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {cancelLabel || "Cancel"}
          </Button>
        )}
        <Button onClick={onSubmit} className="flex-1" disabled={!formData.name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

