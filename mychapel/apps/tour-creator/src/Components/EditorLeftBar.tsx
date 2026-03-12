import styles from "../styles/EditorLeftBar.module.css";

type EditorLeftBarProps = {
    topButtonLabel: string;
    onTopButton?: () => void;
    name: string;
    admin: string;
    onSave?: () => void;
    saveLabel?: string;
    onView?: () => void;
    viewLabel?: string;
    viewDisabled?: boolean;
    onPublish?: () => void;
    publishLabel?: string;
};

function EditorLeftBar({
    topButtonLabel,
    onTopButton,
    name,
    admin,
    onSave,
    saveLabel = "Save Tour",
    onView,
    viewLabel = "View Tour",
    viewDisabled = false,
    onPublish,
    publishLabel = "Publish Tour",
}: EditorLeftBarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarBox}>
                <button onClick={onTopButton} className={styles.topBtn}>
                    {topButtonLabel}
                </button>
            </div>

            <div className={styles.sidebarMetaRow}>
                <div className={styles.sidebarMetaCell}>
                    <div className={styles.sidebarMetaLabel}>Name</div>
                    <div className={styles.sidebarMetaValue}>{name}</div>
                </div>
                <div className={styles.sidebarMetaCell}>
                    <div className={styles.sidebarMetaLabel}>Admin</div>
                    <div className={styles.sidebarMetaValue}>{admin}</div>
                </div>
            </div>

            {onSave ? (
                <div className={styles.sidebarBox}>
                    <button onClick={onSave} className={styles.saveBtn}>
                        {saveLabel}
                    </button>
                </div>
            ) : null}

            {onView ? (
                <div className={styles.sidebarBox}>
                    <button
                        onClick={onView}
                        className={styles.viewBtn}
                        disabled={viewDisabled}
                    >
                        {viewLabel}
                    </button>
                </div>
            ) : null}

            {onPublish ? (
                <div className={styles.sidebarBox}>
                    <button
                        onClick={onPublish}
                        className={styles.publishBtn}
                    >
                        {publishLabel}
                    </button>
                </div>
            ) : null}
        </aside>
    );
}

export default EditorLeftBar;