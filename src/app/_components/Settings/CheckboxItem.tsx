import React from 'react';
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

interface CheckboxItemProps {
  id: string;
  label: string;
}

export default function CheckboxItem({ id, label }: CheckboxItemProps) {
  return (
    <div className="flex items-center">
      <Checkbox id={id} />
      <Label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">{label}</Label>
    </div>
  );
}