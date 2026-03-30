export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: () => void;
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}
