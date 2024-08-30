import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

interface CommonContextMenuProps {
  actions: MenuAction[];
}

const CommonContextMenu: React.FC<CommonContextMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="no-highlight flex h-8 w-8 items-center justify-center rounded-full p-0 text-amber-500 transition-colors duration-200 ease-in-out hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300"
        onClick={toggleMenu}
      >
        <MoreHorizontal size={20} />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 flex items-center space-x-1 rounded-full bg-white px-2 py-1 shadow-lg dark:bg-gray-800"
            style={{
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
            }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={`no-highlight flex h-8 w-8 items-center justify-center rounded-full p-0 transition-colors duration-200 ease-in-out ${action.className}`}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="no-highlight flex h-8 w-8 items-center justify-center rounded-full p-0 text-amber-500 transition-colors duration-200 ease-in-out hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommonContextMenu;
