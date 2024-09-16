import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Zap,
  Loader2,
  Trash2,
  RefreshCw,
  Pen,
  X,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "~/server/db/schema";
import ConfirmModal from "./ConfirmModal";

interface TaskMenuProps {
  task: Task;
  isGeneratingSubtasks: boolean;
  hasChildren: boolean;
  onGenerateSubtasks: () => void;
  onRefreshSubtasks: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubtask: () => void;
}

export default function TaskMenu({
  isGeneratingSubtasks,
  hasChildren,
  onGenerateSubtasks,
  onRefreshSubtasks,
  onEdit,
  onDelete,
  onAddSubtask,
}: TaskMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFocusTrapped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const iconButtonClass =
    "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight flex items-center justify-center";

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenu(!showMenu);
    if (!showMenu) {
      setTimeout(() => setIsMenuOpen(true), 150);
    } else {
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => {
    setShowMenu(false);
    setIsMenuOpen(false);
  };

  const handleGenerateOrRefresh = () => {
    closeMenu();
    if (hasChildren) {
      setShowConfirmModal(true);
    } else {
      void onGenerateSubtasks();
    }
  };

  const handleConfirmRegenerate = () => {
    setShowConfirmModal(false);
    void onRefreshSubtasks();
  };

  const handleEdit = () => {
    closeMenu();
    onEdit();
  };

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  const handleAddSubtask = () => {
    closeMenu();
    onAddSubtask();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);

  const getButtonClass = (baseClass: string) => {
    return `${iconButtonClass} ${baseClass} ${isMenuOpen ? "" : "pointer-events-none"}`;
  };

  return (
    <>
      <div className="absolute right-0 top-0 flex items-center" ref={menuRef}>
        {isGeneratingSubtasks ? (
          <Button
            variant="ghost"
            className={`${iconButtonClass} text-primary-light dark:text-primary-dark`}
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
            className={`no-highlight flex items-center overflow-hidden ${
              showMenu ? "bg-primary-light/10 dark:bg-primary-dark/10" : "bg-transparent"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSubtask();
                    }}
                    disabled={isFocusTrapped}
                    className={getButtonClass(
                      "text-primary-light hover:bg-primary-light hover:text-white dark:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-white",
                    )}
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateOrRefresh();
                    }}
                    disabled={isGeneratingSubtasks || isFocusTrapped}
                    className={getButtonClass(
                      "text-primary-light hover:bg-primary-light hover:text-white dark:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-white",
                    )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    disabled={isFocusTrapped}
                    className={getButtonClass(
                      "text-secondary-light hover:bg-secondary-light hover:text-white dark:text-secondary-dark dark:hover:bg-secondary-dark dark:hover:text-white",
                    )}
                  >
                    <Pen size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isFocusTrapped}
                    className={getButtonClass(
                      "text-red-500 hover:bg-red-500 hover:text-white dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-white",
                    )}
                  >
                    <Trash2 size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={toggleMenu}
                    disabled={isFocusTrapped}
                    className={getButtonClass(
                      "text-primary-light hover:bg-primary-light/10 hover:text-primary-dark dark:text-primary-dark dark:hover:bg-primary-dark/10 dark:hover:text-primary-light",
                    )}
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
                className={`${iconButtonClass} text-primary-light hover:bg-primary-light/10 hover:text-primary-dark dark:text-primary-dark dark:hover:bg-primary-dark/10 dark:hover:text-primary-light`}
              >
                <MoreHorizontal size={20} />
              </Button>
            )}
          </motion.div>
        )}
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRegenerate}
        title="Regenerate Subtasks"
        message="This task already has subtasks. Do you want to replace them with new ones?"
        confirmText="Replace"
        cancelText="Cancel"
      />
    </>
  );
}