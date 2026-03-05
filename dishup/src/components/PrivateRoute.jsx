import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    return isLoggedIn ? children : <Navigate to="/login" />;
}
