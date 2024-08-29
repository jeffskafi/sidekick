import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RamsDropdownProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  width?: string;
  children: React.ReactNode;
}

export const RamsDropdown: React.FC<RamsDropdownProps> = ({
  options,
  onChange,
  width = "300px",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionToggle = (option: string) => {
    onChange([option]);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative font-sans" style={{ width }}>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
          >
            {options.map((option) => (
              <motion.li
                key={option}
                className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 transition-colors duration-200 ease-in-out hover:bg-primary-light hover:text-white dark:text-gray-100 dark:hover:bg-primary-dark"
                onClick={() => handleOptionToggle(option)}
                whileHover="hover"
              >
                <motion.div
                  className="absolute bottom-0 left-0 top-0 w-1 bg-secondary-light dark:bg-secondary-dark"
                  initial={{ scaleX: 0 }}
                  variants={{
                    hover: { scaleX: 1 },
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ originX: 0 }}
                />
                <span className="relative z-10 block truncate">{option}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
