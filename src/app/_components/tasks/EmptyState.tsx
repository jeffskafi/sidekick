import { ClipboardList } from "lucide-react";

const EmptyState: React.FC = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ClipboardList size={48} className={`${ 'text-gray-600' } mb-4`} />
        <h3 className={`text-lg font-semibold mb-2 ${ 'text-gray-300' }`}>
          No tasks yet
        </h3>
        <p className={`text-sm ${ 'text-gray-400' }`}>
          Add a task to get started!
        </p>
      </div>
    );
  };

export default EmptyState;