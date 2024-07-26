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
  hasDueDate: boolean;
  dueDate: Date | null;
  onSetDueDate: (params: { hasDueDate: boolean; dueDate: Date | null }) => void;
}

const DueDateButton: React.FC<DueDateButtonProps> = ({
  hasDueDate,
  dueDate,
  onSetDueDate,
}) => {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="mr-2 flex h-5 w-auto items-center justify-center transition-colors duration-300 focus:outline-none"
          title={hasDueDate ? `Due: ${formatDueDate(dueDate)}` : "Set due date"}
        >
          {hasDueDate && dueDate ? (
            <span
              className={`text-xs ${theme === "dark" ? "text-amber-400" : "text-amber-500"}`}
            >
              {formatDueDate(dueDate)}
            </span>
          ) : (
            <Clock
              size={14}
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
          selected={dueDate}
          onSelect={(date: Date | null) =>
            onSetDueDate({
              hasDueDate: !!date,
              dueDate: date,
            })
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export default DueDateButton;
