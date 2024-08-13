import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Zap, Loader2, Trash2, RefreshCw, Pen, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "~/server/db/schema";

const hoverClass = (baseClass: string): string =>
  `${baseClass} hover-effect:${baseClass}`;

interface TaskMenuProps {
  task: Task;
  isGeneratingSubtasks: boolean;
  hasChildren: boolean;
  onGenerateSubtasks: () => void;
  onRefreshSubtasks: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskMenu({
  isGeneratingSubtasks,
  hasChildren,
  onGenerateSubtasks,
  onRefreshSubtasks,
  onEdit,
  onDelete,
}: TaskMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isFocusTrapped,] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ellipsisRef = useRef<HTMLButtonElement>(null);

  const iconButtonClass = "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight";

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleGenerateOrRefresh = () => {
    closeMenu();
    void (hasChildren ? onRefreshSubtasks() : onGenerateSubtasks());
  };

  const handleEdit = () => {
    closeMenu();
    onEdit();
  };

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="absolute right-0 top-1/2 flex -translate-y-1/2 transform items-center"
      ref={menuRef}
    >
      {isGeneratingSubtasks ? (
        <Button
          variant="ghost"
          className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400")}`}
          disabled
        >
          <Loader2 className="animate-spin" size={20} />
        </Button>
      ) : (
        <motion.div
          initial={false}
          animate={{
            width: showMenu ? "auto" : "32px",
            borderRadius: showMenu ? "16px" : "50%",
          }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          className={`flex items-center overflow-hidden no-highlight ${
            showMenu
              ? "bg-amber-100 dark:bg-amber-900"
              : "bg-transparent"
          }`}
        >
          <AnimatePresence initial={false}>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                className="flex items-center space-x-2"
              >
                <Button
                  variant="ghost"
                  onClick={handleGenerateOrRefresh}
                  disabled={isGeneratingSubtasks || isFocusTrapped}
                  className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-white dark:hover:text-white hover:bg-amber-500 dark:hover:bg-amber-500")} ${
                    isGeneratingSubtasks || isFocusTrapped
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isGeneratingSubtasks ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : hasChildren ? (
                    <RefreshCw size={20} />
                  ) : (
                    <Zap size={20} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleEdit}
                  disabled={isFocusTrapped}
                  className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-gray-100 dark:hover:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/50")}`}
                >
                  <Pen size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isFocusTrapped}
                  className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900")}`}
                >
                  <Trash2 size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={toggleMenu}
                  disabled={isFocusTrapped}
                  className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900")}`}
                >
                  <X size={20} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!showMenu && (
            <Button
              variant="ghost"
              onClick={toggleMenu}
              ref={ellipsisRef}
              className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
            >
              <MoreHorizontal size={20} />
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}