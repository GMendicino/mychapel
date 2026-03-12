import { useState } from "react";
import styles from "./styles/LoginPage.module.css";

interface LoginPageProps {
    onLoginSuccess?: (isSuperAdmin: boolean, username: string) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        localStorage.removeItem("authToken");

        if (!username && !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!username) {
            setError("Please enter a username");
            return;
        }

        if (!password) {
            setError("Please enter a password");
            return;
        }

         try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            // Store token in localStorage
            localStorage.setItem("authToken", data.token);

            if (onLoginSuccess) {
                onLoginSuccess(data.isSuperAdmin, data.username);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>Login</div>
            <form onSubmit={handleSubmit}>
                <div className={styles.body}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className={styles.errorText}>{error}</div>}
                </div>
                <div className={styles.actions}>
                    <button className={styles.submitBtn} type="submit">Login</button>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;