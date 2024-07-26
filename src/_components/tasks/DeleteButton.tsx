import { X } from "lucide-react";

interface DeleteButtonProps {
    onDelete: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
    return (
      <button
        onClick={onDelete}
        className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300"
        aria-label="Delete task"
      >
        <X size={14} className="text-red-500" />
      </button>
    );
  };

export default DeleteButton;