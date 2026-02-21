import { useAtom } from "jotai";
import { Settings, Clock, Sun, Moon, Monitor } from "lucide-react";
import {
  timeUnitAtom,
  themeAtom,
  TIME_UNIT_OPTIONS,
  type TimeUnit,
  type Theme,
} from "@/atoms/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsDropdown() {
  const [timeUnit, setTimeUnit] = useAtom(timeUnitAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Settings className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {/* Time Unit */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Clock className="size-3.5" />
          Time Display
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={timeUnit}
          onValueChange={(v) => setTimeUnit(v as TimeUnit)}
        >
          {TIME_UNIT_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Theme */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sun className="size-3.5" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                <Icon className="size-3.5 mr-2" />
                {opt.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

