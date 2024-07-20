import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RamsDropdown } from "./Dropdown";

interface AssignWorkPopupProps {
  agentName: string;
  onClose: () => void;
  onAssignWork: (tasks: string[]) => void;
}

const availableTasks = [
  "Patrol Area A",
  "Investigate Anomaly B",
  "Collect Resources at Point C",
  "Maintain Equipment D",
  "Scout Location E",
  "Analyze Data F",
  "Repair System G",
  "Monitor Environment H",
];

export const AssignWorkPopup: React.FC<AssignWorkPopupProps> = ({ agentName, onClose, onAssignWork }) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleSubmit = () => {
    onAssignWork(selectedTasks);
    onClose();
  };

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
          display: 'flex',
          flexDirection: 'column',
        }}
        className="bg-white bg-opacity-70 backdrop-blur-[20px] rounded-md shadow-lg border border-white border-opacity-20 max-w-md w-max z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 relative">
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold mb-4">Assign Tasks to {agentName}</h3>
          <RamsDropdown
            options={availableTasks}
            selectedValues={selectedTasks}
            onChange={setSelectedTasks}
            placeholder="Select or type tasks"
          />
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            disabled={selectedTasks.length === 0}
          >
            Assign Tasks ({selectedTasks.length})
          </Button>
        </div>
      </motion.div>
    </>
  );
};