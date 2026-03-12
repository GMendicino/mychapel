import { useEffect, useState } from "react";
import styles from "./styles/SuperAdminPage.module.css";
import { type Project, isPublished, listProjects } from "./script/storage";
import leftBarStyles from "./styles/EditorLeftBar.module.css";

type Props = {
    onOpenProject?: (p: Project) => void;
    username: string;
    onLogout: () => void;
};

export default function AdminPage({ onOpenProject, username, onLogout }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadProjects = async () => {
            const loadedProjects = await listProjects();

            const publishedEntries = await Promise.all(
                loadedProjects.map(async (project) => {
                    try {
                        return [project.id, await isPublished(project.id)] as const;
                    } catch {
                        return [project.id, false] as const;
                    }
                })
            );

            setPublishedMap(Object.fromEntries(publishedEntries));
            setProjects(loadedProjects);
        };

        loadProjects();
    }, []);

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const publishedProjects = filteredProjects.filter((project) => publishedMap[project.id]);
    const unpublishedProjects = filteredProjects.filter((project) => !publishedMap[project.id]);

    const renderProjectCard = (project: Project) => {
        const thumbnail = project.tour?.mainPage?.logo || project.tour?.startNode?.imageSrc;

        return (
            <div
                key={project.id}
                className={styles.card}
                onClick={() => onOpenProject?.(project)}
            >
                <div className={styles.cardImageWrapper}>
                    {thumbnail ? (
                        <img src={thumbnail} alt={project.name} className={styles.cardImage} />
                    ) : (
                        <div className={styles.placeholderImage}>No Preview</div>
                    )}
                    <div className={styles.cardOverlay}>
                        <span className={styles.editLabel}>Edit Project</span>
                    </div>
                </div>
                <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{project.name}</h3>
                    <div className={styles.cardMetaRow}>
                        <span className={styles.adminBadge}>{"\u{1F464}"} {project.admin}</span>
                        <span className={styles.sceneCount}>
                            {"\u{1F4F7}"} {project.tour?.createdPanoNodes?.length || 0} Scenes
                        </span>
                    </div>
                    <div className={styles.cardFooter}>
                        {publishedMap[project.id] ? (
                            <div className={styles.liveBadge}>Live</div>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={styles.container}
            style={{ width: "100vw", maxWidth: "none", margin: 0, padding: 0, background: "transparent" }}
        >
            <div style={{ display: "flex", minHeight: "100vh", width: "100%", flex: 1 }}>
                <aside className={leftBarStyles.sidebar}>
                    <div className={leftBarStyles.sidebarBox}>
                        <h1 className={styles.appTitle}>Tour Manager</h1>
                    </div>
                    <div className={leftBarStyles.sidebarBox}>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            <a
                                href="https://tour-75k.pages.dev"
                                className={styles.secondaryBtn}
                                style={{ textAlign: "center" }}
                            >
                                Back to Website
                            </a>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.75rem",
                                    width: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        outline: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "default",
                                    }}
                                >
                                    👤 {username}
                                </div>
                                <button
                                    onClick={onLogout}
                                    className={styles.secondaryBtn}
                                    style={{ width: "100%", color: "red" }}
                                >
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
                            {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}
                        </span>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📂</div>
                            <h3>No projects assigned</h3>
                            <p>You don't have any projects yet. Contact a superadmin to get a project assigned to you.</p>
                        </div>
                    ) : (
                        <div className={styles.projectSections}>
                            <section className={styles.projectSection}>
                                <div className={styles.sectionHeaderRow}>
                                    <h2 className={styles.sectionTitle}>Published Tours</h2>
                                </div>
                                {publishedProjects.length === 0 ? (
                                    <p className={styles.sectionEmptyText}>No published tours found.</p>
                                ) : (
                                    <div className={styles.grid}>
                                        {publishedProjects.map(renderProjectCard)}
                                    </div>
                                )}
                            </section>

                            <section className={styles.projectSection}>
                                <div className={styles.sectionHeaderRow}>
                                    <h2 className={styles.sectionTitle}>Unpublished Tours</h2>
                                </div>
                                {unpublishedProjects.length === 0 ? (
                                    <p className={styles.sectionEmptyText}>No unpublished tours found.</p>
                                ) : (
                                    <div className={styles.grid}>
                                        {unpublishedProjects.map(renderProjectCard)}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}