import { MessageSquare } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <MessageSquare className="w-6 h-6 text-indigo-600" />
      <span className="text-xl font-semibold text-gray-900">ChatApp</span>
    </div>
  );
}
