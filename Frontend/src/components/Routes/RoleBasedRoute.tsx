import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute = ({ children, allowedRoles }: Props) => {
  const { isLoggedIn, user, authLoading } = useAuth();

  if (authLoading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const userRole = user?.role || user?.user_type || "";

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
