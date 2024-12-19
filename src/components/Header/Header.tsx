import {MenuIcon, MessageCirclePlus } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import Sidebar from "./Sidebar";
import { IconButton } from "@mui/material";
import ChatControl from "../ui/chat-control";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import RightSideBar from "../ui/rightside-drawer";
export function Header({ createNewChat,open,setOpen,openRight,setOpenRight}) {
  const handleDrawerOpen = () => {
    setOpen(true);

  };
 const handleDrawerClose=()=>{
  setOpen(false);
 
 }
 const handleChatControl=()=>{
  setOpenRight(!openRight)
 }

  return (
 
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#303540] border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex">
          <div className="flex">
            {open ? (<IconButton
  size="large"
  edge="start"
  aria-label="menu"
  onClick={handleDrawerClose}
  disableRipple // Removes ripple effect
  disableFocusRipple // Removes focus ripple
  sx={{
    mr: 2,
    color: 'white',
    '&:focus': { outline: 'none' }, // Removes focus outline
    '&:active': { outline: 'none' }, // Removes outline on click
  }}
>
  <MenuOpenIcon style={{ color: 'white'}} />
</IconButton>
) : (      <IconButton
          size="large"
          edge="start"
          aria-label="menu"
          onClick={handleDrawerOpen}
          disableFocusRipple // Removes focus ripple
          sx={{
            mr: 2,
            color: 'white',
            '&:focus': { outline: 'none' }, // Removes focus outline
            '&:active': { outline: 'none' }, // Removes outline on click
          }}
          >
  <MenuIcon style={{ color: 'white' }} /> {/* Ensures the MenuIcon is white */}
</IconButton>)}
    

         <div className="mt-2 ml-8">
         <Logo /> 
         </div>
        
          </div>
        
        
        {/* <div className="lg:-ml-80 mt-2"> */}
        {/* <Logo /> */}
        {/* </div> */}
       
        </div>
       
        {/* <Navigation /> */}
        <UserMenu />

        <div className="flex relative group ml-2">
          <div className="flex" onClick={handleChatControl}>
          <ChatControl/>
          </div>
        
        
          
          <MessageCirclePlus
            className="cursor-pointer w-8 h-8 text-white ml-4"
            onClick={() => createNewChat()}
          />
         
  
      
        </div>
      </div>
    </header>
  );
}
