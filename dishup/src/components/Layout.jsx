// src/components/Layout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button } from "react-bootstrap";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} />

            {/* Main Content */}
            <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
                {/* Tombol toggle */}
                <Button
                    variant="secondary"
                    className="mb-3"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? "Tutup Menu" : "Buka Menu"}
                </Button>

                {/* Konten halaman */}
                {children}
            </div>
        </div>
    );
}
