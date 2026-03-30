import { ReactNode } from "react";
import { Card } from "./card";
import { Button } from "./button";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="p-12 border-0 shadow-lg text-center">
      <div className="flex justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{subtitle}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
