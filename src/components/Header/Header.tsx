import { MessageCirclePlus } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import Sidebar from "./Sidebar";

export function Header({ createNewChat,open,setOpen }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className={`flex ${open ? "lg:ml-48" :""}`}>
          <div className="mr-16">
          <Sidebar createNewChat={createNewChat} open={open} setOpen={setOpen}/>
          </div>
        <div className="lg:-ml-80 mt-2">
        <Logo />
        </div>
       
        </div>
       
        {/* <Navigation /> */}
        <UserMenu />

        <div className="relative group">
          {/* <MessageCirclePlus
            className="cursor-pointer w-6 h-6 text-indigo-600"
            onClick={() => createNewChat()}
          /> */}
        
        </div>
      </div>
    </header>
  );
}
