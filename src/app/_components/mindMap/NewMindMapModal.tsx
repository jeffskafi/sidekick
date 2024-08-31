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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Mind Map</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={rootNodeLabel}
            onChange={(e) => setRootNodeLabel(e.target.value)}
            placeholder="Enter root node label"
            className="mb-4"
          />
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMindMapModal;
