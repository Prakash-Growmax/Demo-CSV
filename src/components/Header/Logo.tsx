import { MessageSquare } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <MessageSquare className="w-6 h-6 text-white" />
      <span className="text-2xl font-semibold text-white">ChatApp</span>
    </div>
  );
}
