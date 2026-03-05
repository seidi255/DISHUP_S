import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useRole() {
    const { profile, loading: authLoading } = useAuth();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (profile && profile.role) {
                setRole(profile.role);
            } else {
                setRole(null);
            }
            setLoading(false);
        }
    }, [profile, authLoading]);

    return { role, loading: authLoading || loading };
}
