import React from "react";
import { useTheme } from "./ThemeProvider";

const TaskDetails: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div
      className={`flex h-full items-center justify-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
    >
      <p className="text-lg">Select a task to view details</p>
    </div>
  );
};

export default TaskDetails;
