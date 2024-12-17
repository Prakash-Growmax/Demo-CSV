import {Router, Route } from "react-router-dom";

const ProtectedRoute = (component) =>{
    return (    
    <div>
     <Router>
        <Route path="/" element={<component/>}/>
     </Router>
    </div>
  )};
  

export default ProtectedRoute