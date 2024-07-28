import React from "react";
import { useTheme } from "../ThemeProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { formatDueDate } from "./helpers";
import { cn } from "~/lib/utils";
import CustomCalendar from "~/components/ui/calendar";
import { Clock } from "lucide-react";

interface DueDateButtonProps {
  dueDate: string | null;
  onSetDueDate: (dueDate: string | null) => void;
  size?: number;
}

const DueDateButton: React.FC<DueDateButtonProps> = ({
  dueDate,
  onSetDueDate,
  size = 16,
}) => {
  const { theme } = useTheme();

  const handleDateSelect = (date: Date | null) => {
    onSetDueDate(date ? date.toISOString() : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="mr-2 flex h-5 w-auto items-center justify-center transition-colors duration-300 focus:outline-none"
          title={dueDate ? `Due: ${formatDueDate(dueDate)}` : "Set due date"}
        >
          {dueDate ? (
            <span
              className={`text-xs ${theme === "dark" ? "text-amber-400" : "text-amber-500"}`}
            >
              {formatDueDate(dueDate)}
            </span>
          ) : (
            <Clock
              size={size}
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto rounded-xl p-0",
          theme === "dark" ? "bg-gray-800" : "bg-white",
        )}
        align="start"
      >
        <CustomCalendar
          selected={dueDate ? new Date(dueDate) : null}
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DueDateButton;