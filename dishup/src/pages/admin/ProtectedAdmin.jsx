import { Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useRole } from "../../hooks/useRole";

export default function ProtectedAdmin({ children }) {
    const { role, loading } = useRole();

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}
