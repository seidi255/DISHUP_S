import { Navigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

export default function AdminRoute({ children, allowedRoles = ["admin"] }) {
    const [allowed, setAllowed] = useState(null);

    useEffect(() => {
        const checkRole = () => {
            const tokenRaw = localStorage.getItem('dishup_token');
            if (!tokenRaw) {
                setAllowed(false);
                return;
            }
            try {
                const userData = JSON.parse(atob(tokenRaw));
                const userRole = userData.role || "user";
                setAllowed(allowedRoles.includes(userRole));
            } catch (e) {
                setAllowed(false);
            }
        };

        checkRole();
    }, [allowedRoles]);

    if (allowed === null)
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
                <p>Cek akses...</p>
            </div>
        );

    return allowed ? children : <Navigate to="/" replace />;
}
