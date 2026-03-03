import { useEffect, useState } from "react";
import styles from "./styles/SuperAdminPage.module.css"; 
import { type Project, listProjects } from "./script/storage";
import leftBarStyles from "./styles/EditorLeftBar.module.css";

type Props = { 
    onOpenProject?: (p: Project) => void;
    username: string;
    onLogout: () => void;
};

export default function AdminPage({ onOpenProject, username, onLogout }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        listProjects().then(setProjects);
    }, []);

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className={styles.container}
            style={{ width: "100vw", maxWidth: "none", margin: 0, padding: 0, background: "transparent" }}
        >
            <div style={{ display: "flex", minHeight: "100vh", width: "100%", flex: 1  }}>
                <aside className={leftBarStyles.sidebar}>
                    <div className={leftBarStyles.sidebarBox}>
                        <h1 className={styles.appTitle}>Tour Manager</h1>
                    </div>
                    <div className={leftBarStyles.sidebarBox}>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            <a href="https://tour-75k.pages.dev"className={styles.secondaryBtn} style={{ textAlign: "center" }}>
                                Back to Website
                            </a>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.75rem",
                                    width: "100%",
                                }}>
                                <div
                                    style={{
                                        width: "100%",
                                        outline: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "default",
                                    }}>
                                    👤 {username}
                                </div>
                                <button onClick={onLogout} className={styles.secondaryBtn} style={{ width: "100%", color: "red" }}>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <main
                    className={styles.main}
                    style={{ flex: 1, width: "100%", maxWidth: "none", margin: 0, background: "transparent" }}
                >
                <div className={styles.toolbar}>
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        className={styles.searchBar}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className={styles.projectCount}>
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                    </span>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📂</div>
                        <h3>No projects assigned</h3>
                        <p>You don't have any projects yet. Contact a superadmin to get a project assigned to you.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredProjects.map((p) => {
                            const thumbnail = p.tour?.mainPage?.logo || p.tour?.startNode?.imageSrc;

                            return (
                                <div 
                                    key={p.id} 
                                    className={styles.card} 
                                    onClick={() => onOpenProject?.(p)}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        {thumbnail ? (
                                            <img src={thumbnail} alt={p.name} className={styles.cardImage} />
                                        ) : (
                                            <div className={styles.placeholderImage}>No Preview</div>
                                        )}
                                        <div className={styles.cardOverlay}>
                                            <span className={styles.editLabel}>Edit Project</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{p.name}</h3>
                                        <div className={styles.cardMetaRow}>
                                            <span className={styles.adminBadge}>👤 {p.admin}</span>
                                            <span className={styles.sceneCount}>
                                                📷 {p.tour?.createdPanoNodes?.length || 0} Scenes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                </main>
            </div>
        </div>
    );
}