import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router";

interface Props {
  children: ReactNode;
}

const ProtectedRoutes = ({ children }: Props) => {
  const [isAuthenticated, setAuthenticated] = useState<Boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthenticated(false);
    } else {
      setAuthenticated(true);
    }
  }, []);

  if (isAuthenticated == null) return <div className="">loading....</div>;

  if (isAuthenticated == false) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoutes;
