import { ClipboardList } from "lucide-react";

const EmptyState: React.FC = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ClipboardList size={48} className="text-amber-500 dark:text-amber-400 mb-4" />
        <h3 className={`text-lg font-semibold mb-2 text-amber-700 dark:text-amber-300`}>
          No tasks yet
        </h3>
        <p className={`text-sm text-amber-600 dark:text-amber-400`}>
          Add a task to get started!
        </p>
      </div>
    );
  };

export default EmptyState;