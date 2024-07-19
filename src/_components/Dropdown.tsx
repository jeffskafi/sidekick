import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';

interface RamsDropdownProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const RamsDropdown: React.FC<RamsDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select or type options',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options
    .filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5); // Limit to 5 options

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleOptionToggle(searchTerm.trim());
    }
  };

  const handleOptionToggle = (option: string) => {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newSelectedValues);
    setSearchTerm(''); // Reset search term after selection
    inputRef.current?.focus(); // Keep focus on input after selection
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center flex-wrap"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedValues.map(value => (
          <span key={value} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-1 px-2.5 py-0.5 rounded flex items-center">
            {value}
            <X 
              size={14} 
              className="ml-1 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                handleOptionToggle(value);
              }} 
            />
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedValues.length === 0 ? placeholder : ''}
          className="flex-grow focus:outline-none min-w-[50px]"
        />
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {filteredOptions.map((option) => (
              <li
                key={option}
                className={`${
                  selectedValues.includes(option) ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50`}
                onClick={() => handleOptionToggle(option)}
              >
                <span className="block truncate">{option}</span>
                {selectedValues.includes(option) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};