import { useGetChatHistory } from "@/hooks/useGetChatHistory"
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import { useState } from "react";

const RecentChat=()=>{
    const { id } = useParams();
    const [recent,setRecent]=useState(true);
 const {data}=useGetChatHistory(id);
 console.log(data);
 return(
    <Chat message={data} recent={recent} setRecent={setRecent}/>
 )

}
export default RecentChat