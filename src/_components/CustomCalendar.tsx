import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import styles from '../styles/CustomCalendar.module.css';

interface CustomCalendarProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selected, onSelect }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    return selected && date.getTime() === selected.getTime();
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
      const dayClasses = [
        styles.day,
        theme === 'dark' ? styles.dayDark : styles.dayLight,
        isPast(date) && styles.disabled,
        isToday(date) && styles.today,
        isSelected(date) && styles.selected,
      ].filter(Boolean).join(' ');

      days.push(
        <div key={i} className={dayClasses} onClick={() => handleDateClick(date)}>
          {i}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`${styles.calendar} ${theme === 'dark' ? styles.calendarDark : styles.calendarLight}`}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={`${styles.navButton} ${theme === 'dark' ? styles.navButtonDark : styles.navButtonLight}`}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={nextMonth} className={`${styles.navButton} ${theme === 'dark' ? styles.navButtonDark : styles.navButtonLight}`}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className={styles.weekdays}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className={styles.days}>
        {Array(firstDayOfMonth).fill(null).map((_, index) => (
          <div key={`empty-${index}`} className={styles.day} />
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default CustomCalendar;