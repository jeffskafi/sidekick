import React, { useState } from "react";
import type { Node } from "./types";

interface EditNodeModalProps {
  node: Node;
  onConfirm: (newLabel: string) => void;
  onCancel: () => void;
}

const EditNodeModal: React.FC<EditNodeModalProps> = ({
  node,
  onConfirm,
  onCancel,
}) => {
  const [newLabel, setNewLabel] = useState(node.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(newLabel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">Edit Node</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="mb-4 w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="mr-2 rounded bg-gray-200 px-4 py-2 dark:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNodeModal;
