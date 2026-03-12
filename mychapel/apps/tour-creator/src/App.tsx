import { useEffect, useState } from "react";
import SuperAdminPage from "./SuperAdminPage";
import AdminPage from "./AdminPage";
import EditProjectPage from "./EditProjectPage";
import LoginPage from "./LoginPage";
import type { Project } from "./script/storage";


export default function App() {
    const [view, setView] = useState<"login" | "admin" | "edit">("login");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [username, setUsername] = useState("");
    
    const [loading, setLoading] = useState(true);

    // Auto-login with serverside token verification
    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            setLoading(false);
            return;
        }

        fetch("/me", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Invalid token");
                return res.json();
            })
            .then(data => {
                setUsername(data.username);
                setIsSuperAdmin(data.isSuperAdmin);
                setView("admin");
            })
            .catch(() => {
                localStorage.removeItem("authToken");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => { 
        localStorage.removeItem("authToken");
        setView("login");
        setIsSuperAdmin(false);
        setUsername("");
    };

    if (view === "login") {
        return <LoginPage onLoginSuccess={(isSuper, user) => {
            setIsSuperAdmin(isSuper); setView("admin");
            setUsername(user);
            setView("admin");
        }} />;
    }

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    if (view === "edit" && selectedProject) {
        return <EditProjectPage project={selectedProject} onReturn={() => setView("admin")} />;
    }

    if (view === "admin") {
        if (isSuperAdmin) {
            return (
                <SuperAdminPage
                    username={username}
                    onLogout={handleLogout}
                    onOpenProject={(project) => {
                        setSelectedProject(project);
                        setView("edit");
                    }}
                />
            );
        } else {
            return (
                <AdminPage
                    username={username}
                    onLogout={handleLogout}
                    onOpenProject={(project) => {
                        setSelectedProject(project);
                        setView("edit");
                    }}
                />
            )
        }
    }
}
