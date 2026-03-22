import type { ReactNode } from "react";

interface CardButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export default function CardButton({ children, onClick }: CardButtonProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border shadow-sm p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
    >
      {children}
    </div>
  );
}
