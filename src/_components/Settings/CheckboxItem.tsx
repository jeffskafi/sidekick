import React from 'react';
import { Label } from "~/components/ui/label";

interface CheckboxItemProps {
  id: string;
  label: string;
}

export default function CheckboxItem({ id, label }: CheckboxItemProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <Label htmlFor={id} className="ml-2 block text-sm text-gray-900">{label}</Label>
    </div>
  );
}