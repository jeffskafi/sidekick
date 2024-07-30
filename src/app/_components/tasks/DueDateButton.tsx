import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import CustomCalendar from "~/components/ui/calendar";
import { Clock } from "lucide-react";

interface DueDateButtonProps {
  dueDate: Date | null;
  onSetDueDate: (dueDate: Date | null) => Promise<void>;
  size?: number;
  theme: 'light' | 'dark';
}

const DueDateButton: React.FC<DueDateButtonProps> = async ({
  dueDate,
  onSetDueDate,
  size = 16,
  theme,
}) => {
  const handleDateSelect = async (date: Date | null) => {
    await onSetDueDate(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="mr-2 flex h-5 w-auto items-center justify-center transition-colors duration-300 focus:outline-none"
          title={dueDate ? `Due: ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : "Set due date"}
        >
          {dueDate ? (
            <span
              className={`text-xs ${theme === "dark" ? "text-amber-400" : "text-amber-500"}`}
            >
              {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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