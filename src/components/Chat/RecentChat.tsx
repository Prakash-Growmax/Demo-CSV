import { useGetChatHistory } from "@/hooks/useGetChatHistory"
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import { useState } from "react";

const RecentChat=()=>{
    const { id } = useParams();
 const {data}=useGetChatHistory(id);
 const [recent,setRecent]=useState(true);

 return(
    <Chat message={data} recent={recent}/>
 )

}
export default RecentChat