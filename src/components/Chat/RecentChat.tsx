import { useGetChatHistory } from "@/hooks/useGetChatHistory"
import { useParams } from "react-router-dom";
import Chat from "./Chat";

const RecentChat=()=>{
    const { id } = useParams();
 const {data}=useGetChatHistory(id);
 console.log(data);
 return(
    <Chat message={data}/>
 )

}
export default RecentChat