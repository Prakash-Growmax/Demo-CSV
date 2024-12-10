import { MessageCirclePlus } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

export function Header({ createNewChat }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Logo />
        {/* <Navigation /> */}
        <UserMenu />

        <div className="relative group">
          <MessageCirclePlus
            className="cursor-pointer w-6 h-6 text-indigo-600"
            onClick={() => createNewChat()}
          />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            New Chat
          </div>
        </div>
      </div>
    </header>
  );
}
