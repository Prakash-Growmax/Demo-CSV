
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Rootlayout from "./components/Layout/Rootlayout";
import RecentChat from "./components/Chat/RecentChat";

function App() {
   const router = createBrowserRouter([
    {
      path: '/',
      element: <Rootlayout />,
    
    },
    {
      path: 'chat/:id',
      element: <RecentChat />,
    },
   ]);

   return <RouterProvider router={router} />;
}

export default App;

