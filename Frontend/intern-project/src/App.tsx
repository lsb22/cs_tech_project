import Login from "./components/Login";
import { Routes, Route } from "react-router";
import Register from "./components/Register";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
