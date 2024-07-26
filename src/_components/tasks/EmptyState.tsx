import { useTheme } from "~/_components/ThemeProvider";
import { ClipboardList } from "lucide-react";

const EmptyState: React.FC = () => {
    const { theme } = useTheme();
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ClipboardList size={48} className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          No tasks yet
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Add a task to get started!
        </p>
      </div>
    );
  };

export default EmptyState;