import { X } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
  size?: number;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete, size = 16 }) => {
  return (
    <button
      onClick={onDelete}
      className={`flex items-center justify-center rounded-full transition-all duration-300 h-${size} w-${size}`}
      aria-label="Delete task"
    >
      <X size={size} className="text-red-500" />
    </button>
  );
};

export default DeleteButton;