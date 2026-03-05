import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        async function finishLogin() {
            const token = localStorage.getItem('dishup_token');

            if (token) {
                navigate("/dashboard");
            } else {
                navigate("/login");
            }
        }

        finishLogin();
    }, []);

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h3>Menyelesaikan proses login...</h3>
            <p>Harap tunggu sebentar...</p>
        </div>
    );
}
