import React from "react";
import SimpleForm from "./form";
import UsersTable from "./update";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import BasicTable from "./update";
// import UsersList from "./userList";
// import DeleteUser from "./delete";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<SimpleForm />} />
          <Route path="/update" element={<UsersTable/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
