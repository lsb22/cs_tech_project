import Login from "./components/Login";
import { Routes, Route } from "react-router";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AgentLogin from "./components/AgentLogin";
import AgentDashboard from "./components/AgentDashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/:agentEmail"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />
      <Route path="/agentLogin" element={<AgentLogin />} />
      <Route
        path="/agentdashboard/:agentEmail"
        element={
          <ProtectedRoutes>
            <AgentDashboard />
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
};

export default App;
