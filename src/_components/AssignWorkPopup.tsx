import React from "react";
import { motion } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { X } from "lucide-react";

interface AssignWorkPopupProps {
  agentName: string;
  onClose: () => void;
  onAssignWork: (task: string) => void;
}

export const AssignWorkPopup: React.FC<AssignWorkPopupProps> = ({ agentName, onClose, onAssignWork }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-2xl z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.075, ease: "easeInOut" }}
        style={{ 
          originX: 0, 
          originY: 0,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        className="bg-white bg-opacity-70 backdrop-blur-[20px] rounded-md shadow-lg border border-white border-opacity-20 max-w-md w-max z-50"
      >
        <div className="p-3 relative">
          <button 
            onClick={onClose}
            className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          <p className="text-sm mb-3 font-bold text-gray-800 pl-8">
            Select a task to assign to {agentName}:
          </p>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <Select onValueChange={onAssignWork}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task1">Make PDF</SelectItem>
                <SelectItem value="task2">Write content</SelectItem>
                <SelectItem value="task3">Visit website</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </>
  );
};