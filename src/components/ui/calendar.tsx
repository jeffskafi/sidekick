import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../_components/ThemeProvider";
import { cn } from "~/lib/utils";

interface CustomCalendarProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selected, onSelect }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString();
  };

  const handleDateClick = (date: Date) => {
    if (!isPast(date)) {
      onSelect(date);
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayClasses = cn(
        "flex justify-center items-center h-10 w-10 rounded-full cursor-pointer transition-colors",
        theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
        isPast(date) && "text-gray-400 cursor-not-allowed",
        isToday(date) && "font-bold border border-amber-500",
        isSelected(date) && "bg-amber-500 text-white"
      );

      days.push(
        <div key={i} className={dayClasses} onClick={() => handleDateClick(date)}>
          {i}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={cn("font-sans w-full max-w-sm rounded-lg overflow-hidden", theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800")}>
      <div className="flex justify-between items-center p-2">
        <button onClick={() => changeMonth(-1)} className={cn("p-1 rounded-full transition-colors", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}>
          <ChevronLeft size={20} />
        </button>
        <div className="font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={() => changeMonth(1)} className={cn("p-1 rounded-full transition-colors", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-sm p-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 p-2">
        {Array(firstDayOfMonth).fill(null).map((_, index) => (
          <div key={`empty-${index}`} className="h-10 w-10" />
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default CustomCalendar;