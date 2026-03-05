import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        setLoading(true);
        try {
            // Coba ambil user profile dari server menggunakan token yang ada
            const response = await apiClient.get('auth.php?action=me');
            if (response.status === 'success') {
                setUser({
                    id: response.data.user.id,
                    email: response.data.user.email,
                });
                setProfile({
                    id: response.data.user.id,
                    nama: response.data.user.user_metadata.nama,
                    role: response.data.user.user_metadata.role,
                    foto: response.data.user.user_metadata.foto
                });
            } else {
                clearSession();
            }
        } catch (error) {
            console.error("Session check failed:", error);
            clearSession();
        } finally {
            setLoading(false);
        }
    };

    const clearSession = () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('dishup_token');
        localStorage.removeItem('supabase.auth.token'); // bersihkan yang lama juga jika ada
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, checkSession, clearSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
