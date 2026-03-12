import { useEffect, useState } from "react";
import styles from "./styles/SuperAdminPage.module.css";
import { TourNode } from "./script/TourDataStruct";
import { type Project, type Admin, listProjects, saveProjects, listAdmins, deleteTour, reassignTour, deleteAdmin,  isPublished
} from "./script/storage";
import leftBarStyles from "./styles/EditorLeftBar.module.css";

type Props = {
    onOpenProject?: (p: Project) => void;
    username: string;
    onLogout: () => void;
};

// Simple password gen
const genPass = (len = 12) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr, n => chars[n % chars.length]).join("");
};

export default function SuperAdminPage({ onOpenProject, username, onLogout }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({});

    const [showNew, setShowNew] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    const [newName, setNewName] = useState("");
    const [newAdmin, setNewAdmin] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminPass, setAdminPass] = useState("");

    // Delete Admin state
    const [showDeleteAdmin, setShowDeleteAdmin] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [reassignMap, setReassignMap] = useState<Record<string, string>>({});

    // Reassign Tour state
    const [showReassign, setShowReassign] = useState(false);
    const [reassignProject, setReassignProject] = useState<Project | null>(null);
    const [reassignTarget, setReassignTarget] = useState("");

    useEffect(() => {
        loadProjects();
        listAdmins().then(setAdmins);
    }, []);

    const createProject = async () => {
        const name = newName.trim();
        const adminUsername = newAdmin.trim();
        if (!name || !adminUsername) return;

        const selectedAdmin = admins.find(a => a.name === adminUsername);
        if (!selectedAdmin) {
            alert("Admin not found");
            return;
        }

        const tour = new TourNode(name, adminUsername);
        const newProject: Project = {
            id: "new",
            name,
            admin: adminUsername,
            tour
        };

        await saveProjects([newProject], selectedAdmin.id);
        await loadProjects();

        setShowNew(false);
        setNewName("");
        setNewAdmin("");
    };

    const createAdmin = async () => {
        const token = localStorage.getItem("authToken");
        const name = adminName.trim();
        if (!name) return;

        try {
            const response = await fetch("/add-user", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    username: name,
                    password: adminPass,
                    is_superadmin: 0
                })
            });

            const data = await response.json();
            if (data.success) {
                alert("Admin created successfully!");
                const updatedAdmins = await listAdmins();
                setAdmins(updatedAdmins);
            }
        } catch (err) {
            alert("Error creating admin");
        }

        setShowAdmin(false);
        setAdminName("");
        setAdminPass("");
    };

    const deleteProject = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
            try {
                const success = await deleteTour(id);
                if (success) {await loadProjects();}
            } catch (err) {
                alert("Error deleting project");
            }
        }
    };

    const handleOpenCreateProject = () => {
        if (admins.length > 0) {
            setNewAdmin(admins[0].name);
        }
        setShowNew(true);
    };

    const handleOpenCreateAdmin = () => {
        setAdminPass(genPass());
        setShowAdmin(true);
    };

    // --- Delete Admin handlers ---

    const handleOpenDeleteAdmin = () => {
        setAdminToDelete(null);
        setShowDeleteAdmin(true);
    };

    const adminProjects = adminToDelete
        ? projects.filter(p => p.admin === adminToDelete.name)
        : [];

    const otherAdmins = adminToDelete
        ? admins.filter(a => a.id !== adminToDelete.id)
        : admins;

    const allReassigned = adminProjects.every(
        p => reassignMap[p.id] && reassignMap[p.id] !== adminToDelete?.name
    );

    const handleSelectAdminToDelete = (admin: Admin) => {
        const theirProjects = projects.filter(p => p.admin === admin.name);
        setAdminToDelete(admin);

        if (theirProjects.length === 0) return;

        const others = admins.filter(a => a.id !== admin.id);
        const prefill: Record<string, string> = {};
        theirProjects.forEach(p => { prefill[p.id] = others[0]?.name ?? ""; });
        setReassignMap(prefill);
    };

    const handleConfirmDeleteAdmin = async () => {
        if (!adminToDelete) return;

        try {
            for (const p of adminProjects) {
                const newAdminName = reassignMap[p.id];
                const target = admins.find(a => a.name === newAdminName);
                if (!target) continue;
                await reassignTour(target.id, p.id);
                p.admin = newAdminName;
                p.tour.admin = newAdminName;
                await saveProjects([p], target.id);
            }

            const result = await deleteAdmin(adminToDelete.id);

            if (result.success) {
                alert(`Admin "${adminToDelete.name}" deleted.`);
            } else {
                alert(result.message || "Failed to delete admin.");
            }

            await loadProjects();
            const updatedAdmins = await listAdmins();
            setAdmins(updatedAdmins);
        } catch (err) {
            alert("Error deleting admin.");
        } finally {
            setShowDeleteAdmin(false);
            setAdminToDelete(null);
            setReassignMap({});
        }
    };

    // --- Reassign Tour handlers ---

    const handleOpenReassign = () => {
        setReassignProject(null);
        setReassignTarget("");
        setShowReassign(true);
    };

    const handleSelectProjectToReassign = (project: Project) => {
        setReassignProject(project);
        const others = admins.filter(a => a.name !== project.admin);
        setReassignTarget(others[0]?.name ?? "");
    };

    const handleConfirmReassign = async () => {
        if (!reassignProject || !reassignTarget) return;

        try {
            const targetAdmin = admins.find(a => a.name === reassignTarget);
            if (!targetAdmin) return;

            const success = await reassignTour(targetAdmin.id, reassignProject.id);
            if (success) {
                reassignProject.admin = reassignTarget;
                reassignProject.tour.admin = reassignTarget;
                await saveProjects([reassignProject], targetAdmin.id);
                alert(`"${reassignProject.name}" reassigned to ${reassignTarget}.`);
            } else {
                alert("Failed to reassign project.");
            }

            await loadProjects();
        } catch (err) {
            alert("Error reassigning project.");
        } finally {
            setShowReassign(false);
            setReassignProject(null);
            setReassignTarget("");
        }
    };

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

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const publishedProjects = filteredProjects.filter((project) => publishedMap[project.id]);
    const unpublishedProjects = filteredProjects.filter((project) => !publishedMap[project.id]);

    const renderProjectCard = (project: Project) => {
        const thumbnail = project.tour?.mainPage?.logo?.replace('.jpg', '-small.jpg') || project.tour?.startNode?.imageSrc?.replace('.jpg', '-small.jpg');
        const isLive = Boolean(publishedMap[project.id]);
    
        return (
            <div
                key={project.id}
                className={styles.card}
                onClick={() => onOpenProject?.(project)}>
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
                        <div className={styles.liveBadge}>
                            {isLive && "Live"}
                        </div>
                        <span
                            className={styles.deleteBtnWrapper}
                            title={isLive ? "Unpublish this tour before deleting it." : undefined}
                        >
                            <button
                                className={`${styles.deleteBtn} ${isLive ? styles.deleteBtnDisabled : ""}`}
                                onClick={(e) => deleteProject(e, project.id)}
                                title={isLive ? undefined : "Delete Project"}
                                disabled={isLive}
                            >
                                Delete
                            </button>
                        </span>
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
                            <a href="https://tour-75k.pages.dev" className={styles.secondaryBtn} style={{ textAlign: "center" }}>
                                Back to Website
                            </a>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.75rem",
                                    width: "100%"
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        outline: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "default"
                                    }}
                                >
                                    {"\u{1F464}"} {username}
                                </div>
                                <button onClick={onLogout} className={styles.secondaryBtn} style={{ width: "100%", color: "red" }}>
                                    Log Out
                                </button>
                            </div>
                            <button onClick={handleOpenCreateAdmin} className={styles.secondaryBtn}>
                                Create New Admin
                            </button>
                            <button onClick={handleOpenDeleteAdmin} className={styles.secondaryBtn} style={{ color: "#e74c3c" }}>
                                Delete Admin
                            </button>
                            <button onClick={handleOpenReassign} className={styles.secondaryBtn}>
                                Reassign Project
                            </button>
                            <button onClick={handleOpenCreateProject} className={styles.createBtn}>
                                New Project
                            </button>
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
                            <div className={styles.emptyIcon}>{"\u{1F4C2}"}</div>
                            <h3>No projects found</h3>
                            <p>Get started by creating a new project.</p>
                            <button onClick={handleOpenCreateProject} className={styles.createBtn}>
                                Create Project
                            </button>
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

            {/* New Project modal */}
            {showNew && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>New Project</div>
                        <div className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Project Name</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className={styles.input}
                                    placeholder="e.g. Campus Tour"
                                    autoFocus
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Assign Admin</label>
                                <select
                                    value={newAdmin}
                                    onChange={e => setNewAdmin(e.target.value)}
                                    className={styles.select}
                                    disabled={admins.length === 0}
                                >
                                    {admins.length === 0 ? (
                                        <option value="">No admins found</option>
                                    ) : (
                                        admins.map(a => (
                                            <option key={a.id} value={a.name}>{a.name}</option>
                                        ))
                                    )}
                                </select>
                                {admins.length === 0 && (
                                    <p className={styles.errorText}>Please create an admin first.</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowNew(false)}>Cancel</button>
                            <button
                                className={styles.createBtn}
                                onClick={createProject}
                                disabled={!newName.trim() || !newAdmin}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Admin modal */}
            {showAdmin && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>New Admin</div>
                        <div className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Username</label>
                                <input
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Username"
                                    autoFocus
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    value={adminPass}
                                    onChange={e => setAdminPass(e.target.value)}
                                    className={styles.input}
                                    placeholder="Password"
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowAdmin(false)}>Cancel</button>
                            <button
                                className={styles.createBtn}
                                onClick={createAdmin}
                                disabled={!adminName.trim()}
                            >
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Admin modal */}
            {showDeleteAdmin && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        {!adminToDelete ? (
                            <>
                                <div className={styles.modalHeader}>Delete Admin</div>
                                <div className={styles.modalBody}>
                                    {admins.length === 0 ? (
                                        <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No admins found.</p>
                                    ) : (
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Select admin to delete</label>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                {admins.map(a => (
                                                    <button
                                                        key={a.id}
                                                        className={styles.selectionBtn}
                                                        style={{ textAlign: "left", justifyContent: "flex-start", color: "#e74c3c" }}
                                                        onClick={() => handleSelectAdminToDelete(a)}
                                                    >
                                                        {"\u{1F464}"} {a.name}
                                                        <span style={{ marginLeft: "auto", color: "#888", fontSize: 12 }}>
                                                            {projects.filter(p => p.admin === a.name).length} project(s)
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.cancelBtn} onClick={() => setShowDeleteAdmin(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.modalHeader}>
                                    Delete &quot;{adminToDelete.name}&quot;
                                </div>
                                <div className={styles.modalBody}>
                                    {adminProjects.length === 0 ? (
                                        <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
                                            This admin has no projects. You can safely delete them.
                                        </p>
                                    ) : otherAdmins.length === 0 ? (
                                        <p style={{ color: "#e74c3c", fontSize: 13 }}>
                                            No other admins available to reassign projects to. Create another admin first.
                                        </p>
                                    ) : (
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>
                                                Reassign {adminToDelete.name}&apos;s projects before deleting:
                                            </label>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.25rem" }}>
                                                {adminProjects.map(p => (
                                                    <div
                                                        key={p.id}
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "1fr auto",
                                                            alignItems: "center",
                                                            gap: "0.75rem",
                                                            background: "#12122a",
                                                            borderRadius: 7,
                                                            padding: "8px 12px",
                                                            border: "1px solid #2a2a40"
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ color: "#ddd", fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                                                            <div style={{ color: "#666", fontSize: 11 }}>
                                                                {p.tour?.createdPanoNodes?.length || 0} scenes
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={reassignMap[p.id] ?? ""}
                                                            onChange={e => setReassignMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                            className={styles.select}
                                                            style={{ minWidth: 130 }}
                                                        >
                                                            <option value="">-- pick admin --</option>
                                                            {otherAdmins.map(a => (
                                                                <option key={a.id} value={a.name}>{a.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.cancelBtn} onClick={() => setAdminToDelete(null)}>
                                        Back
                                    </button>
                                    <button
                                        className={styles.createBtn}
                                        style={{ background: "#c0392b" }}
                                        disabled={adminProjects.length > 0 && (!allReassigned || otherAdmins.length === 0)}
                                        onClick={handleConfirmDeleteAdmin}
                                    >
                                        {adminProjects.length > 0 ? "Reassign & Delete" : "Delete Admin"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Reassign Project modal */}
            {showReassign && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        {!reassignProject ? (
                            <>
                                <div className={styles.modalHeader}>Reassign Project</div>
                                <div className={styles.modalBody}>
                                    {projects.length === 0 ? (
                                        <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No projects found.</p>
                                    ) : (
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Select a project to reassign</label>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                {projects.map(p => (
                                                    <button
                                                        key={p.id}
                                                        className={styles.selectionBtn}
                                                        style={{ textAlign: "left", justifyContent: "flex-start" }}
                                                        onClick={() => handleSelectProjectToReassign(p)}
                                                    >
                                                        {p.name}
                                                        <span style={{ marginLeft: "auto", color: "#888", fontSize: 12 }}>
                                                            {"\u{1F464}"} {p.admin}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.cancelBtn} onClick={() => setShowReassign(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.modalHeader}>
                                    Reassign &quot;{reassignProject.name}&quot;
                                </div>
                                <div className={styles.modalBody}>
                                    <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 0.75rem" }}>
                                        Currently assigned to: {reassignProject.admin}
                                    </p>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>New admin</label>
                                        <select
                                            value={reassignTarget}
                                            onChange={e => setReassignTarget(e.target.value)}
                                            className={styles.select}
                                        >
                                            {admins
                                                .filter(a => a.name !== reassignProject.admin)
                                                .map(a => (
                                                    <option key={a.id} value={a.name}>{a.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.cancelBtn} onClick={() => setReassignProject(null)}>
                                        Back
                                    </button>
                                    <button
                                        className={styles.createBtn}
                                        disabled={!reassignTarget}
                                        onClick={handleConfirmReassign}
                                    >
                                        Reassign
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}