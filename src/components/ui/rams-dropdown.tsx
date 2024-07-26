import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

interface RamsDropdownProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  width?: string;
}

export const RamsDropdown: React.FC<RamsDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select or type options",
  width = "300px",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleOptionToggle(inputValue.trim());
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedValues.length > 0
    ) {
      const lastValue = selectedValues[selectedValues.length - 1];
      onChange(selectedValues.filter((v) => v !== lastValue));
    }
  };

  const handleOptionToggle = (option: string) => {
    if (!selectedValues.includes(option)) {
      onChange([...selectedValues, option]);
      setInputValue("");
    }
  };

  const filteredOptions = options
    .filter(
      (option) =>
        !selectedValues.includes(option) &&
        option.toLowerCase().includes(inputValue.toLowerCase()),
    )
    .slice(0, 4); // Limit to 4 options

  const renderTags = () => {
    return selectedValues.map((value, index) => (
      <span
        key={index}
        className="mr-1 inline-flex items-center rounded bg-orange-100 px-1 text-sm font-medium text-orange-900"
      >
        {value}
        <X
          size={14}
          className="ml-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onChange(selectedValues.filter((v) => v !== value));
          }}
        />
      </span>
    ));
  };

  return (
    <div ref={dropdownRef} className="relative font-sans" style={{ width }}>
      <div
        className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left shadow-sm focus-within:border-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 ${isOpen ? "rounded-b-none" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap items-center">
          {renderTags()}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            className="min-w-[50px] flex-1 bg-transparent focus:outline-none"
          />
          <ChevronDown
            className={`ml-2 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 transform" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full rounded-b-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {filteredOptions.map((option) => (
              <motion.li
                key={option}
                className={`group relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors duration-200 ease-in-out hover:bg-[#fff5f0]`}
                onClick={() => handleOptionToggle(option)}
                whileHover="hover"
              >
                <motion.div
                  className="absolute bottom-0 left-0 top-0 w-1 bg-[#E25822]"
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
