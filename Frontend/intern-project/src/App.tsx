import Login from "./components/Login";
import { Routes, Route } from "react-router";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
