import { Outlet } from "react-router-dom";
import Chat from "../Chat/Chat";

const Rootlayout = ()=>{
  return(
    <>
      <Chat/>
      <Outlet/>
    </>
  
  )
}
export default Rootlayout;