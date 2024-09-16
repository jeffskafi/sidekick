import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface NewMindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rootNodeLabel: string) => void;
}

const NewMindMapModal: React.FC<NewMindMapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [rootNodeLabel, setRootNodeLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rootNodeLabel.trim()) {
      onConfirm(rootNodeLabel);
      setRootNodeLabel("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface-light dark:bg-surface-dark">
        <DialogHeader>
          <DialogTitle className="text-text-light dark:text-text-dark">
            Create New Mind Map
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={rootNodeLabel}
            onChange={(e) => setRootNodeLabel(e.target.value)}
            placeholder="Enter root node label"
            className="mb-4 bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark"
          />
          <Button
            type="submit"
            className="bg-primary-light text-white hover:bg-secondary-light dark:bg-primary-dark dark:text-black dark:hover:bg-secondary-dark"
          >
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMindMapModal;
